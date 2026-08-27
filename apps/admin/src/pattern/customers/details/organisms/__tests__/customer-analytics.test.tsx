import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

const useGetCustomerAnalyticsQuery = vi.fn();
const useGetAdminDashboardChartsQuery = vi.fn();
const useGetAdminOrdersQuery = vi.fn();

vi.mock('@/redux/services/dashboard/dashboard.api-slice', () => ({
  useGetCustomerAnalyticsQuery: (...args: unknown[]) =>
    useGetCustomerAnalyticsQuery(...args) ?? {
      data: undefined,
      isLoading: false,
    },
  useGetAdminDashboardChartsQuery: (...args: unknown[]) =>
    useGetAdminDashboardChartsQuery(...args) ?? {
      data: undefined,
      isLoading: false,
    },
}));

vi.mock('@/redux/services/orders/orders.api-slice', () => ({
  useGetAdminOrdersQuery: (...args: unknown[]) =>
    useGetAdminOrdersQuery(...args) ?? { data: undefined, isLoading: false },
}));

vi.mock('recharts', async () => {
  const actual = await vi.importActual<typeof import('recharts')>('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <actual.ResponsiveContainer width={600} height={300}>
        {children as never}
      </actual.ResponsiveContainer>
    ),
  };
});

import { CustomerAnalyticsSection } from '../customer-analytics-section';
import { CustomerSpendChart } from '../customer-spend-chart';
import { ActivityByTimeChart } from '../activity-by-time-chart';

const CUSTOMER = '6a42dd1d1ef94a89f9f04679';

beforeEach(() => {
  useGetCustomerAnalyticsQuery.mockReset();
  useGetAdminDashboardChartsQuery.mockReset();
  useGetAdminOrdersQuery.mockReset();
});

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const chart = (data: { label: string; value: number; color?: string }[]) => ({
  chartType: 'bar',
  title: 't',
  series: [{ key: 'k', name: 'n', data }],
});

const analytics = (overrides: Record<string, unknown> = {}) => ({
  customer: CUSTOMER,
  year: 2026,
  currency: 'NGN',
  summary: {
    totalOrders: 14,
    totalSpent: 486000,
    returnedOrders: 2,
    returnRate: 16.7,
    lastOrderAt: '2026-08-15T09:31:00.000Z',
  },
  charts: {
    spendByMonth: chart(
      MONTHS.map((label) => ({ label, value: label === 'Aug' ? 120000 : 0 }))
    ),
    ordersByProductKind: chart([
      { label: 'Custom', value: 9 },
      { label: 'Fabric', value: 0 },
    ]),
    returnsRate: chart([
      { label: 'Returned', value: 2 },
      { label: 'Kept', value: 10 },
    ]),
    activityByHour: chart(
      Array.from({ length: 24 }, (_, hour) => ({
        label: `${hour}h`,
        value: hour === 9 ? 12 : 0,
      }))
    ),
  },
  ...overrides,
});

const withAnalytics = (value: unknown, isLoading = false) =>
  useGetCustomerAnalyticsQuery.mockReturnValue({
    data: value === undefined ? undefined : { data: value },
    isLoading,
  });

describe('CustomerAnalyticsSection', () => {
  it('scopes every request to this customer', () => {
    withAnalytics(analytics());
    useGetAdminOrdersQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
    });

    render(<CustomerAnalyticsSection customerId={CUSTOMER} />);

    // The whole point: nothing on a page about one person may read
    // platform-wide data.
    expect(useGetCustomerAnalyticsQuery).toHaveBeenCalledWith(
      { customerId: CUSTOMER },
      { skip: false }
    );
    expect(useGetAdminOrdersQuery).toHaveBeenCalledWith(
      expect.objectContaining({ customerId: CUSTOMER })
    );
  });

  it('feeds the donuts from the customer payload instead of refetching', () => {
    withAnalytics(analytics());
    useGetAdminOrdersQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
    });

    render(<CustomerAnalyticsSection customerId={CUSTOMER} />);

    expect(screen.getByText('Returns rate')).toBeInTheDocument();
    expect(screen.getByText('Orders by product type')).toBeInTheDocument();
    // The product-type donut must NOT fall back to the dashboard query.
    expect(useGetAdminDashboardChartsQuery).toHaveBeenCalledWith(undefined, {
      skip: true,
    });
  });

  it('drops the zero product-type slices', () => {
    withAnalytics(analytics());
    useGetAdminOrdersQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
    });

    render(<CustomerAnalyticsSection customerId={CUSTOMER} />);

    expect(screen.getByText('Custom')).toBeInTheDocument();
    expect(screen.queryByText('Fabric')).not.toBeInTheDocument();
  });

  it('shows the returns empty template for a customer with no paid orders', () => {
    // The endpoint sends an empty series rather than a 0% claim.
    withAnalytics(
      analytics({
        charts: { ...analytics().charts, returnsRate: chart([]) },
      })
    );
    useGetAdminOrdersQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
    });

    render(<CustomerAnalyticsSection customerId={CUSTOMER} />);

    expect(
      screen.getByText(/once this customer pays for an order/)
    ).toBeInTheDocument();
  });

  it('does not fire the analytics query without an id', () => {
    withAnalytics(undefined);
    useGetAdminOrdersQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
    });

    render(<CustomerAnalyticsSection customerId="" />);

    expect(useGetCustomerAnalyticsQuery).toHaveBeenCalledWith(
      { customerId: '' },
      { skip: true }
    );
  });
});

describe('CustomerSpendChart', () => {
  it('shows lifetime spend in the header and the charted year in the title', () => {
    withAnalytics(analytics());
    render(<CustomerSpendChart customerId={CUSTOMER} />);

    expect(screen.getByText('Spend in 2026')).toBeInTheDocument();
    // Lifetime, deliberately more than the single charted month.
    expect(screen.getByText('Total spent: ₦486,000')).toBeInTheDocument();
  });

  it('renders the empty template for a customer who has never paid', () => {
    withAnalytics(
      analytics({
        summary: { ...analytics().summary, totalSpent: 0 },
        charts: {
          ...analytics().charts,
          spendByMonth: chart(MONTHS.map((label) => ({ label, value: 0 }))),
        },
      })
    );
    render(<CustomerSpendChart customerId={CUSTOMER} />);

    expect(
      screen.getByText(/spend will chart here once they pay for an order/)
    ).toBeInTheDocument();
  });
});

describe('ActivityByTimeChart', () => {
  it('charts the hourly activity the endpoint returned', () => {
    withAnalytics(analytics());
    render(<ActivityByTimeChart customerId={CUSTOMER} />);

    expect(screen.getByText('Activity by Time of Day')).toBeInTheDocument();
    expect(screen.queryByText(/will chart here once/)).not.toBeInTheDocument();
  });

  it('shows an empty state rather than an invented traffic curve', () => {
    // Nothing writes the events this reads, so a flat 24 zeroes is the normal
    // case today — it must not render as a populated chart.
    withAnalytics(
      analytics({
        charts: {
          ...analytics().charts,
          activityByHour: chart(
            Array.from({ length: 24 }, (_, hour) => ({
              label: `${hour}h`,
              value: 0,
            }))
          ),
        },
      })
    );
    render(<ActivityByTimeChart customerId={CUSTOMER} />);

    expect(
      screen.getByText(/once this customer browses the marketplace/)
    ).toBeInTheDocument();
  });
});

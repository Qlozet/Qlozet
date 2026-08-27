import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

const useGetAdminDashboardChartsQuery = vi.fn();

vi.mock('@/redux/services/dashboard/dashboard.api-slice', () => ({
  // Forward the args so tests can assert on RTK Query's `skip` option, and
  // fall back to an idle result for components that render without a stub.
  useGetAdminDashboardChartsQuery: (...args: unknown[]) =>
    useGetAdminDashboardChartsQuery(...args) ?? {
      data: undefined,
      isLoading: false,
    },
}));

// recharts measures its container, which jsdom reports as 0x0 — <ResponsiveContainer>
// then renders nothing and no chart assertion would ever hold. Give it a size.
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

import { MonthlyRevenueChart } from '../monthly-revenue-chart';
import { ExpectedEarningsChart } from '../expected-earnings-chart';
import { OrdersByStatus } from '../orders-by-status';
import { OrdersByGender } from '../orders-by-gender';
import { OrdersByLocation } from '../orders-by-location';
import { OrdersByProductTypeChart } from '../orders-by-product-type-chart';
import { EarningsChart } from '../earnings-chart';
import { OrderCountChart } from '../order-count-chart';

beforeEach(() => useGetAdminDashboardChartsQuery.mockReset());

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

/** Twelve zero-filled months with the named ones set — what the API sends. */
const monthly = (values: Record<string, number>) =>
  MONTHS.map((label) => ({ label, value: values[label] ?? 0 }));

const withBundle = (bundle: unknown) =>
  useGetAdminDashboardChartsQuery.mockReturnValue({
    data: bundle === undefined ? undefined : { data: bundle },
    isLoading: false,
  });

const loading = () =>
  useGetAdminDashboardChartsQuery.mockReturnValue({
    data: undefined,
    isLoading: true,
  });

describe('MonthlyRevenueChart', () => {
  const bundle = (revenue: Record<string, number>, total: number) => ({
    year: 2026,
    currency: 'NGN',
    summary: { revenueThisYear: total, ordersThisYear: 0, expectedEarnings: 0 },
    charts: {
      revenueByMonth: {
        chartType: 'bar',
        title: 'Revenue by Month',
        series: [{ key: 'revenue', name: 'Revenue', data: monthly(revenue) }],
      },
    },
  });

  it("shows the API's year total, not a re-sum of the bars", () => {
    // The single-bar screenshot this replaced read NGN 156,921.99 because the
    // client was summing ten paginated orders. The headline now comes from the
    // same aggregation that produced the bars.
    withBundle(bundle({ Mar: 40000, Aug: 156921.99 }, 196921.99));
    render(<MonthlyRevenueChart />);
    expect(screen.getByText('NGN 196,921.99')).toBeInTheDocument();
  });

  it('labels the axis with the year the API actually charted', () => {
    withBundle(bundle({ Aug: 1 }, 1));
    render(<MonthlyRevenueChart />);
    // Not "this year": the endpoint falls back to the most recent order's year,
    // which on a stale database is not the current one.
    expect(screen.getByText('Revenue in 2026, by month')).toBeInTheDocument();
  });

  it('renders the empty template for a year with no revenue', () => {
    withBundle(bundle({}, 0));
    render(<MonthlyRevenueChart />);
    expect(
      screen.getByText(/Monthly revenue will chart here/)
    ).toBeInTheDocument();
    expect(screen.getByText('NGN 0')).toBeInTheDocument();
  });

  it('renders a skeleton while the query is in flight', () => {
    loading();
    const { container } = render(<MonthlyRevenueChart />);
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(
      0
    );
  });
});

describe('ExpectedEarningsChart', () => {
  const bundle = (expectedEarnings: unknown) => ({
    year: 2026,
    currency: 'NGN',
    summary: { revenueThisYear: 0, ordersThisYear: 0, expectedEarnings: 0 },
    charts: { expectedEarnings },
  });

  const earnings = (
    data: { label: string; value: number }[],
    total: number,
    unscheduled = 0
  ) => ({
    chartType: 'bar',
    title: 'Expected Earnings',
    total,
    unscheduled,
    currency: 'NGN',
    series: [{ key: 'expected_earnings', name: 'Expected Earnings', data }],
  });

  it('shows `total`, which is deliberately more than the bars add up to', () => {
    // Commission on undelivered orders has no release date and therefore no
    // month to plot, but it is still owed — dropping it from the headline would
    // understate the pipeline.
    withBundle(
      bundle(
        earnings(
          [
            { label: 'Dec 2026', value: 180000 },
            { label: 'Jan 2027', value: 232500 },
          ],
          496500,
          84000
        )
      )
    );
    render(<ExpectedEarningsChart />);
    expect(screen.getByText('NGN 496,500')).toBeInTheDocument();
    expect(
      screen.getByText(/NGN 84,000 not yet scheduled/)
    ).toBeInTheDocument();
  });

  it('drops the unscheduled note when every naira has a release month', () => {
    withBundle(
      bundle(earnings([{ label: 'Dec 2026', value: 180000 }], 180000))
    );
    render(<ExpectedEarningsChart />);
    expect(
      screen.getByText('Commission awaiting release, by month')
    ).toBeInTheDocument();
    expect(screen.queryByText(/not yet scheduled/)).not.toBeInTheDocument();
  });

  it('shows the empty template when nothing is awaiting payout', () => {
    withBundle(bundle(earnings([], 0)));
    render(<ExpectedEarningsChart />);
    expect(screen.getByText('Nothing in the pipeline')).toBeInTheDocument();
    // No headline figure at all rather than a ₦0.00 that reads like a data bug.
    expect(screen.queryByText('NGN 0')).not.toBeInTheDocument();
  });

  it('survives a deployment that predates the chart', () => {
    withBundle({ year: 2026, currency: 'NGN', summary: {}, charts: {} });
    render(<ExpectedEarningsChart />);
    expect(screen.getByText('Nothing in the pipeline')).toBeInTheDocument();
  });
});

describe('OrdersByStatus', () => {
  const withStatuses = (data: { label: string; value: number }[]) =>
    withBundle({
      charts: {
        ordersByStatus: {
          chartType: 'pie',
          title: 'Orders by Status',
          series: [{ key: 'status', name: 'Status', data }],
        },
      },
    });

  it('hides the statuses sitting at zero', () => {
    // The endpoint ships all seven so its legend is stable for other consumers;
    // a donut must not draw an invisible wedge with a visible legend row.
    withStatuses([
      { label: 'Processing', value: 48 },
      { label: 'Completed', value: 1 },
      { label: 'Cancelled', value: 0 },
      { label: 'Returned', value: 0 },
    ]);
    render(<OrdersByStatus />);
    expect(screen.getByText('Processing')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.queryByText('Cancelled')).not.toBeInTheDocument();
  });

  it('falls back to the empty template when every status is zero', () => {
    withStatuses([{ label: 'Processing', value: 0 }]);
    render(<OrdersByStatus />);
    expect(
      screen.getByText(/how they split across delivery statuses/)
    ).toBeInTheDocument();
  });
});

describe('OrdersByGender', () => {
  it('reads the audience split and titles the card accordingly', () => {
    // Sourced from the product taxonomy (who the garment is for), not the
    // buyer's profile gender — hence "Sales by audience".
    withBundle({
      charts: {
        ordersByAudience: {
          chartType: 'pie',
          title: 'Orders by Audience',
          series: [
            {
              key: 'audience',
              name: 'Audience',
              data: [
                { label: 'Women', value: 31 },
                { label: 'Men', value: 12 },
              ],
            },
          ],
        },
      },
    });
    render(<OrdersByGender />);
    expect(screen.getByText('Sales by audience')).toBeInTheDocument();
    expect(screen.getByText('Women')).toBeInTheDocument();
  });
});

describe('OrdersByLocation', () => {
  it('charts the top states the API ranked', () => {
    withBundle({
      charts: {
        ordersByLocation: {
          chartType: 'bar',
          title: 'Orders by Location',
          series: [
            {
              key: 'orders',
              name: 'Orders',
              data: [
                { label: 'Lagos', value: 22 },
                { label: 'Unknown', value: 4 },
              ],
            },
          ],
        },
      },
    });
    render(<OrdersByLocation />);
    expect(screen.getAllByText('Lagos').length).toBeGreaterThan(0);
    // Orders with no shipping state are labelled, not dropped — a missing state
    // is a data-quality signal the admin should see.
    expect(screen.getAllByText('Unknown').length).toBeGreaterThan(0);
  });

  it('shows the empty template before any order ships', () => {
    withBundle({
      charts: {
        ordersByLocation: {
          chartType: 'bar',
          title: 'Orders by Location',
          series: [{ key: 'orders', name: 'Orders', data: [] }],
        },
      },
    });
    render(<OrdersByLocation />);
    expect(screen.getByText(/the top regions rank here/)).toBeInTheDocument();
  });
});

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Seven zero-filled weekdays with the named ones set. */
const weekly = (values: Record<string, number>) =>
  DAYS.map((label) => ({ label, value: values[label] ?? 0 }));

describe('EarningsChart', () => {
  it('charts revenue by weekday and sums the bars for the header', () => {
    // Deliberately a different cut from MonthlyRevenueChart. Before this the
    // two cards rendered an identical monthly series.
    withBundle({
      charts: {
        earningsByDay: {
          chartType: 'bar',
          title: 'Earnings',
          series: [
            {
              key: 'earnings',
              name: 'Earnings',
              data: weekly({ Wed: 120000, Fri: 36921.99 }),
            },
          ],
        },
      },
    });
    render(<EarningsChart />);
    expect(screen.getByText('Gross Sales: NGN 156,921.99')).toBeInTheDocument();
    expect(screen.getAllByText('Wed').length).toBeGreaterThan(0);
  });

  it('prefers a caller-supplied gross-sales figure over the summed bars', () => {
    withBundle({
      charts: {
        earningsByDay: {
          chartType: 'bar',
          title: 'Earnings',
          series: [
            { key: 'earnings', name: 'Earnings', data: weekly({ Wed: 1 }) },
          ],
        },
      },
    });
    render(<EarningsChart grossSales="51,000" />);
    expect(screen.getByText('Gross Sales: 51,000')).toBeInTheDocument();
  });
});

describe('OrderCountChart', () => {
  it('reads the weekday volume series, not the monthly one', () => {
    withBundle({
      charts: {
        orderCountByDay: {
          chartType: 'bar',
          title: 'Order Count',
          series: [
            { key: 'order_count', name: 'Orders', data: weekly({ Wed: 12 }) },
          ],
        },
        // A monthly series is present too; reading it would be the old bug.
        orderCountByMonth: {
          chartType: 'bar',
          title: 'Order Count by Month',
          series: [
            { key: 'order_count', name: 'Orders', data: monthly({ Aug: 99 }) },
          ],
        },
      },
    });
    render(<OrderCountChart />);
    expect(screen.getAllByText('Sun').length).toBeGreaterThan(0);
    expect(screen.queryByText('Jan')).not.toBeInTheDocument();
  });
});

describe('OrdersByProductTypeChart', () => {
  it('reads the platform split when no data is supplied', () => {
    withBundle({
      charts: {
        ordersByProductKind: {
          chartType: 'pie',
          title: 'Orders by Product Kind',
          series: [
            {
              key: 'product_kind',
              name: 'Product Kind',
              data: [
                { label: 'Custom', value: 18 },
                { label: 'Fabric', value: 4 },
                { label: 'Accessory', value: 0 },
              ],
            },
          ],
        },
      },
    });
    render(<OrdersByProductTypeChart />);
    expect(screen.getByText('Custom')).toBeInTheDocument();
    // Zero slices are dropped so the donut has no invisible wedge.
    expect(screen.queryByText('Accessory')).not.toBeInTheDocument();
  });

  it('uses caller-supplied data and skips the dashboard request', () => {
    // The customer detail page already holds this customer's split; fetching
    // the platform-wide one would waste a request and risk rendering it here.
    render(<OrdersByProductTypeChart data={[{ name: 'Fabric', value: 3 }]} />);
    expect(screen.getByText('Fabric')).toBeInTheDocument();
    expect(useGetAdminDashboardChartsQuery).toHaveBeenCalledWith(undefined, {
      skip: true,
    });
  });

  it('does not skip when it has to fetch the split itself', () => {
    withBundle({ charts: {} });
    render(<OrdersByProductTypeChart />);
    expect(useGetAdminDashboardChartsQuery).toHaveBeenCalledWith(undefined, {
      skip: false,
    });
  });
});

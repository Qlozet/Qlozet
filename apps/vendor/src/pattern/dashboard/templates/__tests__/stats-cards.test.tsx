import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

const useGetOrdersChartQuery = vi.fn();

vi.mock('@/redux/services/orders/orders.api-slice', () => ({
  useGetOrdersChartQuery: () => useGetOrdersChartQuery(),
}));

import { StatsCards } from '../stats-cards';

const withSummary = (summary: Record<string, unknown> | undefined) => {
  useGetOrdersChartQuery.mockReturnValue({
    data: summary === undefined ? undefined : { data: { summary } },
    isLoading: false,
  });
};

beforeEach(() => {
  useGetOrdersChartQuery.mockReset();
});

describe('StatsCards', () => {
  it('renders skeletons while the chart query is in flight', () => {
    useGetOrdersChartQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
    });
    const { container } = render(<StatsCards />);
    expect(screen.queryByText('Total Orders')).not.toBeInTheDocument();
    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(4);
  });

  it('shows the headline values from the summary', () => {
    withSummary({
      totalOrders: 1000,
      totalEarnings: 50000,
      averageOrdersPerDay: 900,
      totalReturns: 10,
    });
    render(<StatsCards />);
    expect(screen.getByText('1,000')).toBeInTheDocument();
    expect(screen.getByText('₦50,000')).toBeInTheDocument();
    expect(screen.getByText('900')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  // Regression: these four indicators went blank/red when the backend stopped
  // sending the exact `*Change` keys the cards were reading.
  it('shows the percentage indicator for every metric that has one', () => {
    withSummary({
      totalOrders: 1000,
      totalOrdersChange: '+24%',
      totalEarnings: 50000,
      totalEarningsChange: 2.5,
      averageOrdersPerDay: 900,
      average_orders_change: '+2.5%',
      totalReturns: 10,
      totalReturnsChange: '-2.6%',
    });
    render(<StatsCards />);
    expect(screen.getByTestId('stat-change-1')).toHaveTextContent('+24%');
    expect(screen.getByTestId('stat-change-2')).toHaveTextContent('+2.5%');
    expect(screen.getByTestId('stat-change-3')).toHaveTextContent('+2.5%');
    expect(screen.getByTestId('stat-change-4')).toHaveTextContent('-2.6%');
  });

  it('colours a rise green and a fall red', () => {
    withSummary({
      totalOrders: 10,
      totalOrdersChange: 5,
      totalEarnings: 1,
      totalEarningsChange: -5,
    });
    render(<StatsCards />);
    expect(screen.getByTestId('stat-change-1').className).toContain(
      'text-green-600'
    );
    expect(screen.getByTestId('stat-change-2').className).toContain(
      'text-destructive'
    );
  });

  // More returns is bad news, so the colour is inverted for that card only.
  it('colours a rise in returns red', () => {
    withSummary({ totalReturns: 10, totalReturnsChange: '+8%' });
    render(<StatsCards />);
    expect(screen.getByTestId('stat-change-4').className).toContain(
      'text-destructive'
    );
  });

  it('hides the indicator entirely when the summary carries no delta', () => {
    withSummary({
      totalOrders: 1000,
      totalEarnings: 50000,
      averageOrdersPerDay: 900,
      totalReturns: 10,
    });
    render(<StatsCards />);
    for (const id of [1, 2, 3, 4]) {
      expect(screen.queryByTestId(`stat-change-${id}`)).not.toBeInTheDocument();
    }
    // …and never leaks the old red em-dash placeholder into the delta slot.
    expect(screen.queryByText('—')).not.toBeInTheDocument();
  });

  it('renders dashes, not a crash, when the query returns nothing', () => {
    withSummary(undefined);
    render(<StatsCards />);
    expect(screen.getAllByText('—').length).toBe(4);
  });
});

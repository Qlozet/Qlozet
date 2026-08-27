import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

const useGetAdminDashboardQuery = vi.fn();

vi.mock('@/redux/services/dashboard/dashboard.api-slice', () => ({
  useGetAdminDashboardQuery: () => useGetAdminDashboardQuery(),
}));

import { StatsCards } from '../stats-cards';

beforeEach(() => {
  useGetAdminDashboardQuery.mockReset();
});

const withMetrics = (metrics: Record<string, unknown> | undefined) => {
  useGetAdminDashboardQuery.mockReturnValue({
    data: metrics === undefined ? undefined : { data: metrics },
    isLoading: false,
  });
};

describe('admin StatsCards', () => {
  it('renders skeletons while the dashboard query is in flight', () => {
    useGetAdminDashboardQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
    });
    const { container } = render(<StatsCards />);
    expect(screen.queryByText('Total Vendors')).not.toBeInTheDocument();
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(
      0
    );
  });

  it('renders every card in the design', () => {
    withMetrics({});
    render(<StatsCards />);
    for (const title of [
      'Total Vendors',
      'Verified Vendors',
      'Total Customers',
      'Total Orders',
      'Gross Sales',
      'Measurement Accuracy',
    ]) {
      expect(screen.getByText(title)).toBeInTheDocument();
    }
  });

  // The one metric this endpoint actually returns today, in the snake_case the
  // backend really sends.
  it('reads the live order count from total_orders', () => {
    withMetrics({ total_orders: 131 });
    render(<StatsCards />);
    expect(screen.getByText('131')).toBeInTheDocument();
    expect(screen.getAllByText('—').length).toBe(5);
  });

  it('formats counts, currency and percentages', () => {
    withMetrics({
      total_vendors: 1200,
      verified_vendors: 900,
      total_customers: 45000,
      total_orders: 320,
      gross_sales: 1250000,
      measurement_accuracy: 92,
    });
    render(<StatsCards />);
    expect(screen.getByText('1,200')).toBeInTheDocument();
    // A head count, never money — the design's naira prefix here is a slip.
    expect(screen.getByText('45,000')).toBeInTheDocument();
    // ₦ (U+20A6), from the shared formatNaira — not the bare "N" this card
    // used to print from its own local formatter.
    expect(screen.getByText('₦1,250,000')).toBeInTheDocument();
    expect(screen.getByText('92%')).toBeInTheDocument();
  });

  // measurement_accuracy has no backend definition yet, so which casing it
  // arrives in is still unknown; both spellings light the card up.
  it('accepts either casing for measurement accuracy', () => {
    withMetrics({ measurementAccuracy: 92 });
    render(<StatsCards />);
    expect(screen.getByText('92%')).toBeInTheDocument();
  });

  // The keys this file used to read. They are not what the backend sends, and
  // must never resurface as a fallback that masks a real mismatch.
  it('ignores the camelCase keys the backend does not send', () => {
    withMetrics({
      totalVendors: 1200,
      totalOrders: 320,
      grossSales: 1250000,
    });
    render(<StatsCards />);
    expect(screen.getAllByText('—').length).toBe(6);
  });

  // A zero is a real figure and must not be shown as a dash.
  it('renders a zero metric as 0, not a dash', () => {
    withMetrics({ total_orders: 0 });
    render(<StatsCards />);
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getAllByText('—').length).toBe(5);
  });

  // The backend sends no metric for some fields; showing a dash beats
  // rendering a zero the data never supported.
  it('dashes metrics the API did not return', () => {
    withMetrics({ total_vendors: 5 });
    render(<StatsCards />);
    expect(screen.getAllByText('—').length).toBe(5);
  });

  it('renders dashes, not a crash, when the query returns nothing', () => {
    withMetrics(undefined);
    render(<StatsCards />);
    expect(screen.getAllByText('—').length).toBe(6);
  });

  it('links the vendor and order cards to their pages', () => {
    withMetrics({});
    render(<StatsCards />);
    const links = screen.getAllByRole('link', { name: /view all/i });
    expect(links.length).toBe(3);
  });
});

describe('admin StatsCards — change badges', () => {
  const withChanges = (changes: Record<string, unknown>) =>
    withMetrics({
      total_orders: 131,
      changes: { period_days: 30, ...changes },
    });

  it('renders the percentage movement the API reported', () => {
    withChanges({ total_orders: 2.5, total_vendors: 4.3 });
    render(<StatsCards />);

    expect(screen.getByText('2.5%')).toBeInTheDocument();
    expect(screen.getByText('4.3%')).toBeInTheDocument();
  });

  it('renders a fall with its sign, so the card can colour it', () => {
    withChanges({ total_orders: -25 });
    render(<StatsCards />);
    // MetricCard reads the leading "-" to pick the down arrow and red.
    expect(screen.getByText('-25%')).toBeInTheDocument();
  });

  it('shows no badge when the API could not compute one', () => {
    // null means the previous window was empty. A "0%" here would read as
    // "flat" when the truth is "unknown".
    withChanges({ total_orders: null, total_vendors: null });
    render(<StatsCards />);
    expect(screen.queryByText(/%$/)).not.toBeInTheDocument();
  });

  it('does render a genuine 0%', () => {
    // Distinct from null: nothing moved, which is a fact worth showing.
    withChanges({ total_orders: 0 });
    render(<StatsCards />);
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('shows no badges at all against a deployment that predates them', () => {
    withMetrics({ total_orders: 131 });
    render(<StatsCards />);
    expect(screen.queryByText(/%$/)).not.toBeInTheDocument();
  });
});

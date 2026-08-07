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

  it('renders every metric card', () => {
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

  it('formats counts, currency and percentages', () => {
    withMetrics({
      totalVendors: 1200,
      verifiedVendors: 900,
      totalCustomers: 45000,
      totalOrders: 320,
      grossSales: 1250000,
      measurementAccuracy: 92,
    });
    render(<StatsCards />);
    expect(screen.getByText('1,200')).toBeInTheDocument();
    expect(screen.getByText('N 45,000')).toBeInTheDocument();
    expect(screen.getByText('N 1,250,000')).toBeInTheDocument();
    expect(screen.getByText('92%')).toBeInTheDocument();
  });

  // The backend sends no metric for some fields; showing a dash beats
  // rendering a zero the data never supported.
  it('dashes metrics the API did not return', () => {
    withMetrics({ totalVendors: 5 });
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

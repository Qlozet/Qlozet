import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

const useGetAdminDashboardQuery = vi.fn();
const useGetProductQuery = vi.fn();

vi.mock('@/redux/services/dashboard/dashboard.api-slice', () => ({
  useGetAdminDashboardQuery: () => useGetAdminDashboardQuery(),
}));

vi.mock('@/redux/services/products/products.api-slice', () => ({
  useGetProductQuery: (id: string, opts?: { skip?: boolean }) =>
    useGetProductQuery(id, opts),
}));

import { OrderStatsCards } from '../order-stats-cards';

beforeEach(() => {
  useGetAdminDashboardQuery.mockReset();
  useGetProductQuery.mockReset();
  useGetProductQuery.mockReturnValue({ data: undefined });
});

const withMetrics = (metrics: Record<string, unknown> | undefined) => {
  useGetAdminDashboardQuery.mockReturnValue({
    data: metrics === undefined ? undefined : { data: metrics },
    isLoading: false,
  });
};

describe('OrderStatsCards', () => {
  it('renders skeletons while the dashboard query is in flight', () => {
    useGetAdminDashboardQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
    });
    const { container } = render(<OrderStatsCards />);
    expect(screen.queryByText('Total Orders')).not.toBeInTheDocument();
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(
      0
    );
  });

  it('reads platform totals from the dashboard payload', () => {
    withMetrics({
      total_orders: 131,
      orders_delivered: 1,
      orders_in_transit: 48,
    });
    render(<OrderStatsCards />);
    expect(screen.getByText('131')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('48')).toBeInTheDocument();
  });

  // The endpoint takes no period parameter, so the cards must not read as
  // belonging to the page's "This week" filter.
  it('labels the figures as all time', () => {
    withMetrics({ total_orders: 131 });
    render(<OrderStatsCards />);
    expect(screen.getAllByText('all time').length).toBe(4);
  });

  it('names the most purchased product straight from the payload', () => {
    withMetrics({
      must_purchase_products: [
        { totalOrdered: 3, product_id: 'prod-low', name: 'Cap' },
        { totalOrdered: 9, product_id: 'prod-top', name: 'Butterfly Dress' },
      ],
    });
    render(<OrderStatsCards />);
    // The highest totalOrdered wins, and no product lookup is needed.
    expect(screen.getByText('Butterfly Dress')).toBeInTheDocument();
    expect(useGetProductQuery).toHaveBeenCalledWith('', { skip: true });
  });

  // Deployments predating the backend resolving the name send the id alone.
  it('falls back to fetching the product when the payload has no name', () => {
    withMetrics({
      must_purchase_products: [
        { totalOrdered: 3, product_id: 'prod-low' },
        { totalOrdered: 9, product_id: 'prod-top' },
      ],
    });
    useGetProductQuery.mockReturnValue({
      data: { data: { _id: 'prod-top', name: 'Butterfly Two-piece Dress' } },
    });
    render(<OrderStatsCards />);
    expect(useGetProductQuery).toHaveBeenCalledWith('prod-top', {
      skip: false,
    });
    expect(screen.getByText('Butterfly Two-piece Dress')).toBeInTheDocument();
  });

  // Every product in the sample payload carries totalOrdered: 0 — nothing there
  // has been purchased, so naming one would be a fabrication.
  it('dashes the most purchased card when nothing has been ordered', () => {
    withMetrics({
      must_purchase_products: [
        { totalOrdered: 0, product_id: '6a42dd1d1ef94a89f9f04679' },
        { totalOrdered: 0, product_id: '6a4346ca566b33d9bfbd5c6b' },
      ],
    });
    render(<OrderStatsCards />);
    expect(useGetProductQuery).toHaveBeenCalledWith('', { skip: true });
    expect(screen.getAllByText('—').length).toBe(4);
  });

  it('renders dashes, not a crash, when the query returns nothing', () => {
    withMetrics(undefined);
    render(<OrderStatsCards />);
    expect(screen.getAllByText('—').length).toBe(4);
  });

  it('renders a zero count as 0, not a dash', () => {
    withMetrics({ orders_delivered: 0, orders_in_transit: 0 });
    render(<OrderStatsCards />);
    expect(screen.getAllByText('0').length).toBe(2);
  });
});

describe('OrderStatsCards — change badges', () => {
  it('renders a badge on each of the three count cards', () => {
    withMetrics({
      total_orders: 1000,
      orders_delivered: 900,
      orders_in_transit: 3,
      changes: {
        period_days: 30,
        total_orders: 2.5,
        orders_delivered: -1.2,
        orders_in_transit: 8,
      },
    });
    render(<OrderStatsCards />);

    expect(screen.getByText('2.5%')).toBeInTheDocument();
    expect(screen.getByText('-1.2%')).toBeInTheDocument();
    expect(screen.getByText('8%')).toBeInTheDocument();
  });

  it('omits a badge the API could not compute', () => {
    withMetrics({
      total_orders: 1000,
      changes: { period_days: 30, total_orders: null, orders_delivered: 4 },
    });
    render(<OrderStatsCards />);

    expect(screen.getByText('4%')).toBeInTheDocument();
    expect(screen.queryByText('null%')).not.toBeInTheDocument();
  });

  it('never puts a badge on the product-name card', () => {
    // A percentage movement on a NAME has no meaning, whatever the design
    // mock shows — the value is not a quantity.
    withMetrics({
      must_purchase_products: [
        { product_id: 'p1', name: 'Amasi Dress', totalOrdered: 9 },
      ],
      changes: { period_days: 30 },
    });
    render(<OrderStatsCards />);

    expect(screen.getByText('Amasi Dress')).toBeInTheDocument();
    expect(screen.queryByText(/%$/)).not.toBeInTheDocument();
  });

  it('sizes the product name down so a long one fits the card', () => {
    withMetrics({
      must_purchase_products: [
        {
          product_id: 'p1',
          name: 'Hand-embroidered Aso-Oke Two-piece Set',
          totalOrdered: 9,
        },
      ],
    });
    render(<OrderStatsCards />);

    // The numeric cards use text-2xl; a name needs to be smaller and allowed
    // to wrap before it truncates.
    const name = screen.getByText('Hand-embroidered Aso-Oke Two-piece Set');
    expect(name).toHaveClass('text-base');
    expect(name).toHaveClass('line-clamp-2');
    expect(name).not.toHaveClass('text-2xl');
  });

  it('keeps the numeric cards at the larger size', () => {
    withMetrics({ total_orders: 1000 });
    render(<OrderStatsCards />);
    expect(screen.getByText('1,000')).toHaveClass('text-2xl');
  });
});

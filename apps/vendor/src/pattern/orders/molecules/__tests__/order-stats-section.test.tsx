import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

const useGetVendorDashboardMetricsQuery = vi.fn();

vi.mock('@/redux/services/orders/orders.api-slice', () => ({
  useGetVendorDashboardMetricsQuery: () => useGetVendorDashboardMetricsQuery(),
}));

import { OrderStatsSection } from '../order-stats-section';

const withMetrics = (data: Record<string, unknown> | undefined) => {
  useGetVendorDashboardMetricsQuery.mockReturnValue({
    data: data === undefined ? undefined : { data },
    isLoading: false,
    isFetching: false,
  });
};

beforeEach(() => {
  useGetVendorDashboardMetricsQuery.mockReset();
});

describe('OrderStatsSection', () => {
  it('renders skeletons while the metrics query is in flight', () => {
    useGetVendorDashboardMetricsQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isFetching: true,
    });
    const { container } = render(<OrderStatsSection />);
    expect(screen.queryByText('Total Orders')).not.toBeInTheDocument();
    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(4);
  });

  it('shows the counts GET /orders/dashboard sends', () => {
    withMetrics({
      total_orders: 1204,
      orders_delivered: 900,
      orders_in_transit: 12,
    });
    render(<OrderStatsSection />);
    expect(screen.getByText('1,204')).toBeInTheDocument();
    expect(screen.getByText('900')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('renders a real zero as 0, not a dash', () => {
    withMetrics({
      total_orders: 0,
      orders_delivered: 0,
      orders_in_transit: 0,
    });
    render(<OrderStatsSection />);
    expect(screen.getAllByText('0')).toHaveLength(3);
  });

  // The card used to be hardcoded to "N/A" while must_purchase_products sat
  // unread in the payload.
  it('names the most purchased product and how many were ordered', () => {
    withMetrics({
      total_orders: 5,
      orders_delivered: 2,
      orders_in_transit: 1,
      must_purchase_products: [
        { product_id: 'p1', name: 'Ankara Wrap Dress', totalOrdered: 34 },
        { product_id: 'p2', name: 'Linen Shirt', totalOrdered: 9 },
      ],
    });
    render(<OrderStatsSection />);
    expect(screen.getByText('Ankara Wrap Dress')).toBeInTheDocument();
    expect(screen.getByText('34 ordered')).toBeInTheDocument();
    // Only the leader — the rest of the top five are not cards.
    expect(screen.queryByText('Linen Shirt')).not.toBeInTheDocument();
  });

  it('dashes rather than naming a product the API could not resolve', () => {
    // `name` is null when the product carries none under its kind subdocument.
    withMetrics({
      total_orders: 5,
      orders_delivered: 2,
      orders_in_transit: 1,
      must_purchase_products: [
        { product_id: 'p1', name: null, totalOrdered: 34 },
      ],
    });
    render(<OrderStatsSection />);
    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.queryByText('p1')).not.toBeInTheDocument();
  });

  it('dashes every figure the payload has no source for', () => {
    withMetrics(undefined);
    render(<OrderStatsSection />);
    expect(screen.getAllByText('—')).toHaveLength(4);
  });
});

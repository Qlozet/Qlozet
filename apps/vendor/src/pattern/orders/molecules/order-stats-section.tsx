'use client';

// Order Stats Section
// The four headline metric cards above the orders table, from
// GET /orders/dashboard. Every figure is real; a dash means the endpoint had no
// source for the value, and a real 0 renders as 0.

import React, { ReactNode } from 'react';
import { ShoppingCart, Send, Truck, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MetricCard } from '@/pattern/common/molecules/metric-card';
import { StatsCardSkeleton } from '@/pattern/dashboard/molecules/stats-card-skeleton';
import { useGetVendorDashboardMetricsQuery } from '@/redux/services/orders/orders.api-slice';

const CardIcon = ({ bg, children }: { bg: string; children: ReactNode }) => (
  <div
    className={cn(
      'flex size-12 items-center justify-center rounded-[10px] text-white',
      bg
    )}
  >
    {children}
  </div>
);

const count = (value: number | undefined): string =>
  typeof value === 'number' ? value.toLocaleString() : '—';

export const OrderStatsSection: React.FC<{ isLoading?: boolean }> = ({
  isLoading = false,
}) => {
  const {
    data: metricsResponse,
    isLoading: isMetricsLoading,
    isFetching,
  } = useGetVendorDashboardMetricsQuery();
  const showLoading = isLoading || isMetricsLoading || isFetching;

  if (showLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const stats = metricsResponse?.data;

  // Top five, highest first — the card shows the leader. A product whose name
  // could not be resolved is not a leader worth naming, so it dashes rather
  // than rendering an id the vendor cannot recognise.
  const topProduct = stats?.must_purchase_products?.[0];
  const topProductName = topProduct?.name?.trim() || '—';
  const topProductOrdered =
    topProduct && typeof topProduct.totalOrdered === 'number'
      ? `${topProduct.totalOrdered.toLocaleString()} ordered`
      : undefined;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Total Orders"
        value={count(stats?.total_orders)}
        icon={
          <CardIcon bg="bg-[#57CAEB]">
            <ShoppingCart className="size-6" />
          </CardIcon>
        }
      />
      <MetricCard
        title="Orders Delivered"
        value={count(stats?.orders_delivered)}
        icon={
          <CardIcon bg="bg-[#5DDAB4]">
            <Send className="size-6" />
          </CardIcon>
        }
      />
      <MetricCard
        title="Orders in Transit"
        value={count(stats?.orders_in_transit)}
        icon={
          <CardIcon bg="bg-[#FF8F6B]">
            <Truck className="size-6" />
          </CardIcon>
        }
      />
      <MetricCard
        title="Most purchased"
        value={topProductName}
        subLabel={topProductOrdered}
        icon={
          <CardIcon bg="bg-[#FFB200]">
            <Package className="size-6" />
          </CardIcon>
        }
      />
    </div>
  );
};

'use client';

import type { ReactNode } from 'react';
import { ShoppingCart, Send, Truck, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { APP_ROUTES } from '@/lib/routes';
import { MetricCard } from '@/pattern/common/molecules/metric-card';
import { StatsCardSkeleton } from '@/pattern/dashboard/molecules/stats-card-skeleton';
import type { OrderMetrics } from '@/lib/orders';

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

interface OrderStatsCardsProps {
  metrics: OrderMetrics;
  isLoading: boolean;
}

export const OrderStatsCards = ({
  metrics,
  isLoading,
}: OrderStatsCardsProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Total Orders"
        value={metrics.total.toLocaleString()}
        icon={
          <CardIcon bg="bg-[#57CAEB]">
            <ShoppingCart className="size-6" />
          </CardIcon>
        }
        viewAllLink={APP_ROUTES.orders}
      />
      <MetricCard
        title="Orders Delivered"
        value={metrics.delivered.toLocaleString()}
        icon={
          <CardIcon bg="bg-[#5DDAB4]">
            <Send className="size-6" />
          </CardIcon>
        }
      />
      <MetricCard
        title="Orders in Transit"
        value={metrics.inTransit.toLocaleString()}
        icon={
          <CardIcon bg="bg-[#FF8F6B]">
            <Truck className="size-6" />
          </CardIcon>
        }
      />
      <MetricCard
        title="Most purchased order"
        // Product names are only available when the backend populates the
        // order items; show a neutral dash rather than inventing one.
        value={metrics.mostPurchased ?? '—'}
        icon={
          <CardIcon bg="bg-[#57CAEB]">
            <ShoppingBag className="size-6" />
          </CardIcon>
        }
      />
    </div>
  );
};

'use client';

// Order Stats Section
// The four headline metric cards above the orders table. The backend exposes no
// order-stats endpoint, so these use mockup sample values (orders-sample.ts).

import React, { ReactNode } from 'react';
import { ShoppingCart, Send, Truck, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MetricCard } from '@/pattern/common/molecules/metric-card';
import { StatsCardSkeleton } from '@/pattern/dashboard/molecules/stats-card-skeleton';
import { SAMPLE_ORDER_STATS } from '../lib/orders-sample';

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

export const OrderStatsSection: React.FC<{ isLoading?: boolean }> = ({
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const { totalOrders, ordersDelivered, ordersInTransit, mostPurchased, trend } =
    SAMPLE_ORDER_STATS;

  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
      <MetricCard
        title='Total Orders'
        value={totalOrders.toLocaleString()}
        change={trend}
        icon={
          <CardIcon bg='bg-[#57CAEB]'>
            <ShoppingCart className='size-6' />
          </CardIcon>
        }
      />
      <MetricCard
        title='Orders Delivered'
        value={ordersDelivered.toLocaleString()}
        change={trend}
        icon={
          <CardIcon bg='bg-[#5DDAB4]'>
            <Send className='size-6' />
          </CardIcon>
        }
      />
      <MetricCard
        title='Orders in Transit'
        value={ordersInTransit.toLocaleString()}
        icon={
          <CardIcon bg='bg-[#FF8F6B]'>
            <Truck className='size-6' />
          </CardIcon>
        }
      />
      <MetricCard
        title='Most purchased order'
        value={mostPurchased}
        change={trend}
        icon={
          <CardIcon bg='bg-[#FFB200]'>
            <Lock className='size-6' />
          </CardIcon>
        }
      />
    </div>
  );
};

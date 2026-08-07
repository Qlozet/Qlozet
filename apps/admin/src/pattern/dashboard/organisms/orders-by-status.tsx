'use client';

import { useMemo } from 'react';
import { statusBreakdown } from '@/lib/dashboard-series';
import { useGetAdminOrdersQuery } from '@/redux/services/orders/orders.api-slice';
import { DonutChart } from '../molecules/donut-chart';
import { ChartSkeleton } from '../molecules/chart-skeleton';

const COLORS = ['#3d2817', '#8a6f52', '#c4b5a0', '#d4c5b9', '#e8ded4'];

// Real breakdown of every marketplace order by delivery status.
export const OrdersByStatus = () => {
  const { data, isLoading } = useGetAdminOrdersQuery();
  const orders = useMemo(() => data?.data ?? [], [data]);
  const series = useMemo(() => statusBreakdown(orders), [orders]);

  if (isLoading) return <ChartSkeleton />;

  return (
    <DonutChart
      title="Orders by status"
      data={series}
      colors={COLORS}
      emptyDescription="Once orders come in, this shows how they split across delivery statuses."
    />
  );
};

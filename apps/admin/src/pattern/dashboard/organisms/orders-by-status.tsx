'use client';

import { useMemo } from 'react';
import { readSeries, withoutZeroes } from '@/lib/dashboard-series';
import { useGetAdminDashboardChartsQuery } from '@/redux/services/dashboard/dashboard.api-slice';
import { DonutChart } from '../molecules/donut-chart';
import { ChartSkeleton } from '../molecules/chart-skeleton';

const COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
];

// Every marketplace order by delivery status, from
// GET /admin/dashboard/charts → charts.ordersByStatus.
export const OrdersByStatus = () => {
  const { data, isLoading } = useGetAdminDashboardChartsQuery();

  // The endpoint ships all seven statuses — including the ones at zero — so the
  // legend is stable between refreshes. A donut shouldn't draw invisible slices
  // with visible legend rows, so the zeroes are dropped here rather than
  // server-side, where another consumer may want them.
  const series = useMemo(
    () => withoutZeroes(readSeries(data?.data?.charts?.ordersByStatus)),
    [data]
  );

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

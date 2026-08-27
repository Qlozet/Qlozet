'use client';

import { useMemo } from 'react';
import {
  readSeries,
  withoutZeroes,
  type SeriesPoint,
} from '@/lib/dashboard-series';
import { useGetAdminDashboardChartsQuery } from '@/redux/services/dashboard/dashboard.api-slice';
import { DonutChart, type DonutDatum } from '../molecules/donut-chart';
import { ChartSkeleton } from '../molecules/chart-skeleton';

const COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
];

interface OrdersByProductTypeChartProps {
  /**
   * Caller-supplied split, for the customer detail page which charts one
   * buyer's mix. Omit it on the dashboard to read the platform-wide split from
   * GET /admin/dashboard/charts.
   */
  data?: DonutDatum[];
}

// Custom / Non-Custom / Fabric / Accessory split of marketplace orders.
export const OrdersByProductTypeChart = ({
  data,
}: OrdersByProductTypeChartProps) => {
  // Skip the request entirely when the caller already has the data.
  const { data: bundle, isLoading } = useGetAdminDashboardChartsQuery(
    undefined,
    { skip: data !== undefined }
  );

  const series = useMemo<SeriesPoint[]>(
    () =>
      data ??
      withoutZeroes(readSeries(bundle?.data?.charts?.ordersByProductKind)),
    [data, bundle]
  );

  if (data === undefined && isLoading) return <ChartSkeleton />;

  return (
    <DonutChart
      title="Orders by product type"
      data={series}
      colors={COLORS}
      emptyDescription="The product-type split will show once orders are placed against catalogue products."
    />
  );
};

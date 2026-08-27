'use client';

import { useMemo } from 'react';
import { readSeries, withoutZeroes } from '@/lib/dashboard-series';
import { useGetAdminDashboardChartsQuery } from '@/redux/services/dashboard/dashboard.api-slice';
import { DonutChart } from '../molecules/donut-chart';
import { ChartSkeleton } from '../molecules/chart-skeleton';

const COLORS = ['var(--chart-1)', 'var(--chart-4)', 'var(--chart-3)'];

// "Sales by audience", not "orders by gender": the split is read from each
// product's taxonomy audience (men / women / unisex), which says who the
// garment is for. The buyer's profile gender — what an earlier version of the
// backend chart grouped on — is almost always unset and answers a different
// question. Same source the vendor dashboard settled on.
export const OrdersByGender = () => {
  const { data, isLoading } = useGetAdminDashboardChartsQuery();

  const series = useMemo(
    () => withoutZeroes(readSeries(data?.data?.charts?.ordersByAudience)),
    [data]
  );

  if (isLoading) return <ChartSkeleton />;

  return (
    <DonutChart
      title="Sales by audience"
      data={series}
      colors={COLORS}
      emptyDescription="The men / women / unisex split shows once orders carry products with an audience set."
    />
  );
};

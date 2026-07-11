'use client';

import { DonutChart, type DonutDatum } from '../molecules/donut-chart';
import { useGetOrdersChartQuery } from '@/redux/services/orders/orders.api-slice';
import { ChartSkeleton } from '../molecules/chart-skeleton';

const COLORS = ['var(--chart-primary)', 'var(--chart-secondary)'];

export const ReturnsRateChart = () => {
  const { data: chartResponse, isLoading } = useGetOrdersChartQuery();

  if (isLoading) {
    return <ChartSkeleton />;
  }

  const summary = chartResponse?.data?.summary;
  const totalOrders = summary?.totalOrders || 0;
  const totalReturns = summary?.totalReturns || 0;
  const completed = Math.max(0, totalOrders - totalReturns);

  const data: DonutDatum[] = totalOrders === 0 ? [
    { name: 'Completed', value: 100 },
    { name: 'Returned', value: 0 },
  ] : [
    { name: 'Completed', value: completed },
    { name: 'Returned', value: totalReturns },
  ];

  return (
    <DonutChart
      title='Returns rate'
      data={data}
      colors={COLORS}
    />
  );
};

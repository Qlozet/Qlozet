'use client';

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatNaira } from '@/lib/orders';
import { hasAnyValue, monthlyRevenueSeries } from '@/lib/dashboard-series';
import { useGetAdminOrdersQuery } from '@/redux/services/orders/orders.api-slice';
import { CustomYAxisTick } from '../molecules/custom-y-axis-tick';
import { CustomXAxisTick } from '../molecules/custom-x-axis-tick';
import { ChartEmptyState } from '../molecules/chart-empty-state';
import { ChartSkeleton } from '../molecules/chart-skeleton';

interface EarningsChartProps {
  /** Optional gross-sales figure shown on the right of the header. */
  grossSales?: string;
}

// Real marketplace revenue per month, aggregated from /admin/vendor/orders.
export const EarningsChart = ({ grossSales }: EarningsChartProps) => {
  const { data, isLoading } = useGetAdminOrdersQuery();
  const orders = useMemo(() => data?.data ?? [], [data]);
  const series = useMemo(() => monthlyRevenueSeries(orders), [orders]);
  const isEmpty = !hasAnyValue(series);

  const total = useMemo(
    () => series.reduce((sum, point) => sum + point.value, 0),
    [series]
  );

  if (isLoading) return <ChartSkeleton />;

  return (
    <Card className="w-full max-h-fit rounded-[12px] custom-card-shadow">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium text-[hsla(210,9%,31%,1)]">
          Earnings
        </CardTitle>
        <span className="text-sm font-medium text-[hsla(210,9%,31%,1)]">
          Gross Sales: {grossSales ?? formatNaira(total)}
        </span>
      </CardHeader>
      <CardContent className="w-full">
        <ChartEmptyState
          isEmpty={isEmpty}
          height={350}
          description="Monthly earnings will chart here once orders are paid for."
        >
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={series}
              barGap={23}
              margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="0"
                vertical={false}
                stroke="#e5e7eb"
              />
              <XAxis
                dataKey="name"
                tick={<CustomXAxisTick />}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={<CustomYAxisTick />}
                axisLine={false}
                tickLine={false}
              />
              <Bar
                dataKey="value"
                fill="#c4b5a0"
                maxBarSize={24}
                radius={[2.26, 2.26, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartEmptyState>
      </CardContent>
    </Card>
  );
};

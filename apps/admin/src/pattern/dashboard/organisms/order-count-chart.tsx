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
import { hasAnyValue, readSeries } from '@/lib/dashboard-series';
import { useGetAdminDashboardChartsQuery } from '@/redux/services/dashboard/dashboard.api-slice';
import { CustomYAxisTick } from '../molecules/custom-y-axis-tick';
import { CustomXAxisTick } from '../molecules/custom-x-axis-tick';
import { ChartEmptyState } from '../molecules/chart-empty-state';
import { ChartSkeleton } from '../molecules/chart-skeleton';
import { useDashboardRange } from '../lib/use-dashboard-range';

// Order volume over the dashboard window, from GET /admin/dashboard/charts →
// charts.orderCount, bucketed by day, week or month to suit it. Every order
// counts here, paid or not - unlike revenue, which only counts paid ones.
export const OrderCountChart = () => {
  const [range] = useDashboardRange();
  const { data, isLoading } = useGetAdminDashboardChartsQuery({ range });

  const series = useMemo(
    () => readSeries(data?.data?.charts?.orderCount),
    [data]
  );
  const isEmpty = !hasAnyValue(series);

  if (isLoading) return <ChartSkeleton />;

  return (
    <Card className="w-full max-h-fit rounded-[12px] custom-card-shadow">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-[hsla(210,9%,31%,1)] dark:text-white">
          Order Count
        </CardTitle>
      </CardHeader>
      <CardContent className="w-full">
        <ChartEmptyState
          isEmpty={isEmpty}
          height={350}
          description="Order volume will chart here as orders are placed in this period."
        >
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={series}
              barGap={2}
              margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="0"
                vertical={false}
                stroke="var(--border)"
              />
              <XAxis
                dataKey="name"
                tick={<CustomXAxisTick />}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
                minTickGap={18}
              />
              <YAxis
                tick={<CustomYAxisTick />}
                axisLine={false}
                tickLine={false}
              />
              <Bar
                dataKey="value"
                fill="var(--chart-secondary)"
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

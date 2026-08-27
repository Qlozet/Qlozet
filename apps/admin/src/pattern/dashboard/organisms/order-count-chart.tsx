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

// Order volume by day of the WEEK, from GET /admin/dashboard/charts →
// charts.orderCountByDay. Every order counts here, paid or not — unlike the
// earnings series, which only counts orders the customer paid for.
export const OrderCountChart = () => {
  const { data, isLoading } = useGetAdminDashboardChartsQuery();

  const series = useMemo(
    () => readSeries(data?.data?.charts?.orderCountByDay),
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
          description="Order volume will chart here by day of the week as orders are placed."
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
              />
              <YAxis
                tick={<CustomYAxisTick />}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
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

'use client';

import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { hasAnyValue, readSeries } from '@/lib/dashboard-series';
import { useGetAdminDashboardChartsQuery } from '@/redux/services/dashboard/dashboard.api-slice';
import { CustomXAxisTick } from '../molecules/custom-x-axis-tick';
import { CustomYAxisTick } from '../molecules/custom-y-axis-tick';
import { ChartEmptyState } from '../molecules/chart-empty-state';
import { ChartSkeleton } from '../molecules/chart-skeleton';

// Top six states by order count, from GET /admin/dashboard/charts →
// charts.ordersByLocation. Location is the ORDER's shipping state, not the
// customer's profile address — the profile is usually unset, and a customer can
// ship to somewhere other than where they live.
export const OrdersByLocation = () => {
  const { data, isLoading } = useGetAdminDashboardChartsQuery();

  const series = useMemo(
    () => readSeries(data?.data?.charts?.ordersByLocation),
    [data]
  );
  const isEmpty = !hasAnyValue(series);

  if (isLoading) return <ChartSkeleton />;

  return (
    <Card className="w-full rounded-[12px] custom-card-shadow">
      <CardHeader className="px-6 pb-4">
        <CardTitle className="text-sm font-medium text-[hsla(210,9%,31%,1)]">
          Orders by top location
        </CardTitle>
      </CardHeader>
      <CardContent className="w-full px-3 pt-0 pb-6">
        <ChartEmptyState
          isEmpty={isEmpty}
          height={250}
          description="Once orders ship to a delivery address, the top regions rank here."
        >
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={series}
              margin={{ top: 0, right: 0, left: -10, bottom: 0 }}
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
                allowDecimals={false}
              />
              <Bar
                dataKey="value"
                fill="#3d2817"
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

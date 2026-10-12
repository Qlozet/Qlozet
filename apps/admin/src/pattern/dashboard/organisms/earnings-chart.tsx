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
import { hasAnyValue, readSeries, sumSeries } from '@/lib/dashboard-series';
import { useGetAdminDashboardChartsQuery } from '@/redux/services/dashboard/dashboard.api-slice';
import { CustomYAxisTick } from '../molecules/custom-y-axis-tick';
import { CustomXAxisTick } from '../molecules/custom-x-axis-tick';
import { ChartEmptyState } from '../molecules/chart-empty-state';
import { ChartSkeleton } from '../molecules/chart-skeleton';
import { useDashboardRange } from '../lib/use-dashboard-range';

// The PLATFORM's earnings - commission on paid orders - over the dashboard
// window, from GET /admin/dashboard/charts → charts.platformEarnings. This
// used to chart paid order totals by weekday, which is revenue (the card
// above already shows it) under a different name; what the marketplace
// actually earns is the commission, and that is what this card now says.
export const EarningsChart = () => {
  const [range] = useDashboardRange();
  const { data, isLoading } = useGetAdminDashboardChartsQuery({ range });
  const bundle = data?.data;

  const series = useMemo(
    () => readSeries(bundle?.charts?.platformEarnings),
    [bundle]
  );
  const isEmpty = !hasAnyValue(series);
  const total = bundle?.summary?.platformEarnings ?? sumSeries(series);

  if (isLoading) return <ChartSkeleton />;

  return (
    <Card className="w-full max-h-fit rounded-[12px] custom-card-shadow">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium text-[hsla(210,9%,31%,1)] dark:text-white">
          Platform earnings
        </CardTitle>
        <span className="text-sm font-medium text-[hsla(210,9%,31%,1)] dark:text-white">
          Commission: {formatNaira(total)}
        </span>
      </CardHeader>
      <CardContent className="w-full">
        <ChartEmptyState
          isEmpty={isEmpty}
          height={350}
          description="Commission will chart here once orders are paid for in this period."
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

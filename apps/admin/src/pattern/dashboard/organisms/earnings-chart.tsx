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

interface EarningsChartProps {
  /**
   * Optional gross-sales figure for the header. Callers that have the all-time
   * figure from GET /admin/dashboard pass it in; otherwise the header sums the
   * bars below.
   */
  grossSales?: string;
}

// Marketplace revenue by day of the WEEK, from GET /admin/dashboard/charts →
// charts.earningsByDay. Deliberately a different cut from MonthlyRevenueChart,
// which charts the same money by month — the two cards used to render an
// identical monthly series, so one of them said nothing the other didn't.
export const EarningsChart = ({ grossSales }: EarningsChartProps) => {
  const { data, isLoading } = useGetAdminDashboardChartsQuery();
  const bundle = data?.data;

  const series = useMemo(
    () => readSeries(bundle?.charts?.earningsByDay),
    [bundle]
  );
  const isEmpty = !hasAnyValue(series);
  const total = useMemo(() => sumSeries(series), [series]);

  if (isLoading) return <ChartSkeleton />;

  return (
    <Card className="w-full max-h-fit rounded-[12px] custom-card-shadow">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium text-[hsla(210,9%,31%,1)] dark:text-white">
          Earnings
        </CardTitle>
        <span className="text-sm font-medium text-[hsla(210,9%,31%,1)] dark:text-white">
          Gross Sales: {grossSales ?? formatNaira(total)}
        </span>
      </CardHeader>
      <CardContent className="w-full">
        <ChartEmptyState
          isEmpty={isEmpty}
          height={350}
          description="Earnings will chart here by day of the week once orders are paid for."
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

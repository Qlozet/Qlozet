'use client';

import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import { BarChart3 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatNaira } from '@/lib/orders';
import { hasAnyValue, maxOf, readSeries } from '@/lib/dashboard-series';
import { useGetAdminDashboardChartsQuery } from '@/redux/services/dashboard/dashboard.api-slice';
import { CustomXAxisTick } from '../molecules/custom-x-axis-tick';
import { ChartEmptyState } from '../molecules/chart-empty-state';
import { ChartSkeleton } from '../molecules/chart-skeleton';
import { useDashboardRange } from '../lib/use-dashboard-range';

// Marketplace revenue (paid order totals - gross, before refunds and
// commission) over the dashboard window, from GET /admin/dashboard/charts →
// charts.revenue. Bucketed by the server to suit the window: by day, week or
// month. The headline is the API's own sum of the same series.
export const RevenueChart = () => {
  const [range] = useDashboardRange();
  const { data, isLoading } = useGetAdminDashboardChartsQuery({ range });
  const bundle = data?.data;

  const series = useMemo(() => readSeries(bundle?.charts?.revenue), [bundle]);
  const isEmpty = !hasAnyValue(series);
  const total = bundle?.summary?.revenue ?? 0;
  const maxValue = useMemo(() => maxOf(series), [series]);
  const period = bundle?.range
    ? `${bundle.range.label}, by ${bundle.range.unit}`
    : 'Revenue';

  if (isLoading) return <ChartSkeleton />;

  return (
    <Card className="relative w-full h-[450px] overflow-hidden rounded-[12px] custom-card-shadow">
      <span className="absolute top-5 right-5 z-10 flex size-9 items-center justify-center rounded-lg bg-gray-100 dark:bg-muted">
        <BarChart3 className="size-4 text-gray-700 dark:text-gray-200" />
      </span>

      <CardContent className="flex h-full flex-col px-6 pt-7">
        <p className="text-3xl font-bold text-[hsla(210,9%,31%,1)] dark:text-white">
          {formatNaira(isEmpty ? 0 : total)}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">Revenue · {period}</p>

        <div className="mt-8 flex-1">
          <ChartEmptyState
            isEmpty={isEmpty}
            height={280}
            description="Revenue will chart here once orders are paid for in this period."
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={series}
                margin={{ top: 20, right: 40, left: 0, bottom: 0 }}
              >
                <XAxis
                  dataKey="name"
                  tick={<CustomXAxisTick />}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                  minTickGap={18}
                />
                <YAxis hide domain={[0, maxValue * 1.1]} />
                <ReferenceLine
                  y={maxValue}
                  stroke="var(--chart-primary)"
                  strokeDasharray="6 4"
                  strokeWidth={1.5}
                  label={{
                    value: 'MAX',
                    position: 'right',
                    fill: 'var(--chart-primary)',
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                />
                <Bar dataKey="value" maxBarSize={28} radius={[4, 4, 0, 0]}>
                  {series.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.value === maxValue && maxValue > 0
                          ? 'var(--chart-primary)'
                          : 'var(--chart-4)'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartEmptyState>
        </div>
      </CardContent>
    </Card>
  );
};

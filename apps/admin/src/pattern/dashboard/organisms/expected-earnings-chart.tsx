'use client';

import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import { BarChart3 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatNaira } from '@/lib/orders';
import { maxOf, readSeries, withoutZeroes } from '@/lib/dashboard-series';
import { useGetAdminDashboardChartsQuery } from '@/redux/services/dashboard/dashboard.api-slice';
import { CustomXAxisTick } from '../molecules/custom-x-axis-tick';
import { ChartEmptyState } from '../molecules/chart-empty-state';
import { ChartSkeleton } from '../molecules/chart-skeleton';

// Platform commission that is booked against an order but not yet released to
// the vendor, bucketed by the month it is due to release. This is money already
// committed, NOT a forecast — nothing extrapolates from past orders.
//
// The card previously showed a hardcoded EUR figure and a fake trend line; then,
// once that was removed, a permanent "No forecast yet" template. It is now wired
// to GET /admin/dashboard/charts → charts.expectedEarnings.
export const ExpectedEarningsChart = () => {
  const { data, isLoading } = useGetAdminDashboardChartsQuery();
  const chart = data?.data?.charts?.expectedEarnings;

  // Drop the zero months. A release month whose commission sums to nothing is
  // not a bar — left in, it contributed an axis tick with no column above it.
  const series = useMemo(() => withoutZeroes(readSeries(chart)), [chart]);
  const maxValue = useMemo(() => maxOf(series), [series]);

  // `total` is not the sum of the bars: commission on orders that haven't been
  // delivered has no release date, so it has no month to plot in. It is real
  // money owed, so it belongs in the headline even though it has no bar.
  const total = chart?.total ?? 0;
  const unscheduled = chart?.unscheduled ?? 0;

  // Two independent questions. There can be money to report with nothing to
  // plot — when every naira of it is still unscheduled — so the headline and
  // the chart area decide separately. Tying them together rendered an empty
  // plot area under a real figure.
  const hasMoney = total > 0;
  const hasBars = series.length > 0;

  if (isLoading) return <ChartSkeleton />;

  return (
    <Card className="relative w-full h-[450px] overflow-hidden rounded-[12px] custom-card-shadow">
      <span className="absolute top-5 right-5 z-10 flex size-9 items-center justify-center rounded-lg bg-gray-100">
        <BarChart3 className="size-4 text-gray-700" />
      </span>

      <CardContent className="flex h-full flex-col px-6 pt-7">
        <p className="text-sm text-[hsla(210,9%,31%,1)]">Expected earnings</p>

        {hasMoney && (
          <>
            <p className="mt-2 text-2xl font-bold text-[hsla(210,9%,31%,1)]">
              {formatNaira(total)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {unscheduled > 0
                ? `Commission awaiting release — ${formatNaira(unscheduled)} not yet scheduled`
                : 'Commission awaiting release, by month'}
            </p>
          </>
        )}

        <div className="mt-6 flex flex-1 items-center">
          <ChartEmptyState
            isEmpty={!hasBars}
            message={
              hasMoney ? 'Nothing scheduled yet' : 'Nothing in the pipeline'
            }
            description={
              hasMoney
                ? 'None of this commission has a release date yet — one is set when an order is delivered.'
                : "Expected earnings show the platform commission on orders that haven't paid out yet."
            }
            height={220}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={series}
                margin={{ top: 10, right: 8, left: 0, bottom: 0 }}
              >
                <XAxis
                  dataKey="name"
                  tick={<CustomXAxisTick />}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide domain={[0, maxValue * 1.1]} />
                <Bar dataKey="value" maxBarSize={28} radius={[4, 4, 0, 0]}>
                  {series.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.value === maxValue && maxValue > 0
                          ? '#3d2817'
                          : '#d4c5b9'
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

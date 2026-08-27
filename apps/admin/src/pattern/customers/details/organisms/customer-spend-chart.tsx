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
import { hasAnyValue, readSeries } from '@/lib/dashboard-series';
import { useGetCustomerAnalyticsQuery } from '@/redux/services/dashboard/dashboard.api-slice';
import { CustomYAxisTick } from '@/pattern/dashboard/molecules/custom-y-axis-tick';
import { CustomXAxisTick } from '@/pattern/dashboard/molecules/custom-x-axis-tick';
import { ChartEmptyState } from '@/pattern/dashboard/molecules/chart-empty-state';
import { ChartSkeleton } from '@/pattern/dashboard/molecules/chart-skeleton';

interface CustomerSpendChartProps {
  customerId: string;
}

// What this customer paid, per month, from GET /admin/customer/:id/analytics.
//
// Replaces a reused dashboard EarningsChart that charted PLATFORM-wide revenue
// under a hardcoded "Gross Sales: 51,000" header — two different lies on a page
// about one person. The header now shows their lifetime spend, which the
// endpoint computes over their paid orders.
export const CustomerSpendChart = ({ customerId }: CustomerSpendChartProps) => {
  const { data, isLoading } = useGetCustomerAnalyticsQuery(
    { customerId },
    { skip: !customerId }
  );
  const analytics = data?.data;

  const series = useMemo(
    () => readSeries(analytics?.charts?.spendByMonth),
    [analytics]
  );
  const isEmpty = !hasAnyValue(series);

  if (isLoading) return <ChartSkeleton />;

  return (
    <Card className="w-full max-h-fit rounded-[12px] custom-card-shadow">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium text-[hsla(210,9%,31%,1)] dark:text-white">
          {analytics?.year ? `Spend in ${analytics.year}` : 'Spend'}
        </CardTitle>
        <span className="text-sm font-medium text-[hsla(210,9%,31%,1)] dark:text-white">
          {/* Lifetime, so it is deliberately >= the charted year's bars. */}
          Total spent: {formatNaira(analytics?.summary?.totalSpent ?? 0)}
        </span>
      </CardHeader>
      <CardContent className="w-full">
        <ChartEmptyState
          isEmpty={isEmpty}
          height={350}
          description="This customer's spend will chart here once they pay for an order."
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
                fill="var(--chart-4)"
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

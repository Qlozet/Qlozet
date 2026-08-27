'use client';

import { useMemo } from 'react';
import {
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { hasAnyValue, readSeries } from '@/lib/dashboard-series';
import { useGetCustomerAnalyticsQuery } from '@/redux/services/dashboard/dashboard.api-slice';
import { CustomYAxisTick } from '@/pattern/dashboard/molecules/custom-y-axis-tick';
import { CustomXAxisTick } from '@/pattern/dashboard/molecules/custom-x-axis-tick';
import { ChartEmptyState } from '@/pattern/dashboard/molecules/chart-empty-state';
import { ChartSkeleton } from '@/pattern/dashboard/molecules/chart-skeleton';

interface ActivityByTimeChartProps {
  customerId: string;
}

// When this customer is active, by hour of day (Africa/Lagos), from
// GET /admin/customer/:id/analytics → charts.activityByHour.
//
// Called "activity", not "sessions": the source is the recommendations `events`
// collection — item views, searches, cart changes — which is not session
// tracking. The card previously drew a hardcoded curve peaking at 50,000
// sessions for a single customer.
//
// Nothing server-side writes those events; they arrive only from clients
// POSTing /recommendations/events. Until one does, this shows its empty state,
// which is the truthful result.
export const ActivityByTimeChart = ({
  customerId,
}: ActivityByTimeChartProps) => {
  const { data, isLoading } = useGetCustomerAnalyticsQuery(
    { customerId },
    { skip: !customerId }
  );

  const series = useMemo(
    () => readSeries(data?.data?.charts?.activityByHour),
    [data]
  );
  const isEmpty = !hasAnyValue(series);

  if (isLoading) return <ChartSkeleton />;

  return (
    <Card className="w-full max-h-[450px] rounded-[12px] custom-card-shadow">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-[hsla(210,9%,31%,1)]">
          Activity by Time of Day
        </CardTitle>
      </CardHeader>
      <CardContent className="w-full">
        <ChartEmptyState
          isEmpty={isEmpty}
          height={350}
          description="On-platform activity will chart here once this customer browses the marketplace."
        >
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart
              data={series}
              margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="sessionsFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c4b5a0" stopOpacity={0.7} />
                  <stop offset="100%" stopColor="#c4b5a0" stopOpacity={0.05} />
                </linearGradient>
              </defs>
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
                // 24 hourly ticks would overlap; label every third hour.
                interval={2}
              />
              <YAxis
                tick={<CustomYAxisTick />}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#8a7060"
                strokeWidth={2}
                fill="url(#sessionsFill)"
                dot={{ stroke: '#8a7060', strokeWidth: 2, fill: '#fff', r: 4 }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartEmptyState>
      </CardContent>
    </Card>
  );
};

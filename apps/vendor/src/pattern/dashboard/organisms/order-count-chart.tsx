'use client';

import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetOrdersChartQuery } from '@/redux/services/orders/orders.api-slice';
import { ChartSkeleton } from '../molecules/chart-skeleton';
import { CustomYAxisTick } from '../molecules/custom-y-axis-tick';
import { CustomXAxisTick } from '../molecules/custom-x-axis-tick';
import { ChartEmptyState } from '../molecules/chart-empty-state';
import { useDashboardRange } from '../lib/use-dashboard-range';

/** height: the plot height; shorter when it sits under the earnings chart. */
export const OrderCountChart = ({ height = 350 }: { height?: number }) => {
  const [range] = useDashboardRange();
  const { data: chartResponse, isLoading } = useGetOrdersChartQuery({ range });

  if (isLoading) {
    return <ChartSkeleton />;
  }

  const seriesData =
    chartResponse?.data?.charts?.orderCountByDay?.series?.[0]?.data ?? [];
  const hasData =
    seriesData.length > 0 && seriesData.some((item: any) => item.value > 0);

  const chartData = seriesData.map((item: any) => ({
    day: item.label,
    earnings: item.value, // reusing "earnings" key since the BarChart is bound to it
  }));

  const maxEarnings = Math.max(...chartData.map((d: any) => d.earnings), 0);

  return (
    <Card className="w-full max-h-fit rounded-[12px] custom-card-shadow">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-foreground">
          Orders per day
        </CardTitle>
      </CardHeader>
      <CardContent className="w-full">
        <ChartEmptyState
          isEmpty={!hasData}
          variant="bar"
          description="Order count trends will show here as orders come in"
          height={height}
        >
          <ResponsiveContainer width="100%" height={height}>
            <BarChart
              data={chartData}
              barGap={2}
              margin={{ top: 0, right: 0, left: -25, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="0"
                vertical={false}
                stroke="var(--border)"
              />
              <XAxis
                dataKey="day"
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
                dataKey="earnings"
                maxBarSize={24}
                radius={[2.26, 2.26, 0, 0]}
              >
                {chartData.map((entry: any, index: number) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.earnings === maxEarnings
                        ? 'var(--chart-primary)'
                        : 'var(--chart-secondary)'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartEmptyState>
      </CardContent>
    </Card>
  );
};

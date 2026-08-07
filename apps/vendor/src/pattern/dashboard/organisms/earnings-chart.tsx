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
import { useGetEarningsChartQuery } from '@/redux/services/business/business.api-slice';
import { ChartSkeleton } from '../molecules/chart-skeleton';
import { CustomYAxisTick } from '../molecules/custom-y-axis-tick';
import { CustomXAxisTick } from '../molecules/custom-x-axis-tick';
import { ChartEmptyState } from '../molecules/chart-empty-state';

export const EarningsChart = () => {
  const { data: earningsResponse, isLoading } = useGetEarningsChartQuery();

  if (isLoading) {
    return <ChartSkeleton />;
  }

  // The earnings endpoint nests its payload under an extra `data` (unlike
  // /orders/chart), so after the global response wrapper the series lives at
  // response.data.data.series. Read the double-nested path first, then fall
  // back to the single-nested shape so it works either way.
  const earningsData: any = earningsResponse?.data;
  const seriesData =
    earningsData?.data?.series?.[0]?.data ??
    earningsData?.series?.[0]?.data ??
    [];
  const hasData =
    seriesData.length > 0 && seriesData.some((item: any) => item.value > 0);

  const chartData = seriesData.map((item: any) => ({
    day: item.label,
    earnings: item.value,
  }));

  const maxEarnings = Math.max(...chartData.map((d: any) => d.earnings), 0);

  return (
    <Card className="w-full max-h-fit rounded-[12px] custom-card-shadow">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-[hsla(210,9%,31%,1)] dark:text-foreground">
          Earnings
        </CardTitle>
      </CardHeader>
      <CardContent className="w-full">
        <ChartEmptyState
          isEmpty={!hasData}
          variant="bar"
          description="Your earnings will appear here once you start receiving orders"
          height={350}
        >
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={chartData}
              barGap={23}
              margin={{ top: 0, right: 0, left: -25, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="0"
                vertical={false}
                stroke="#e5e7eb"
              />
              <XAxis
                dataKey="day"
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

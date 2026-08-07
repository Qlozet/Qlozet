'use client';

import { JSX, useMemo } from 'react';
import { useGetOrdersChartQuery } from '@/redux/services/orders/orders.api-slice';
import { ChartSkeleton } from '../molecules/chart-skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { CustomChartTooltip } from '../molecules/custom-chart-tooltip';
import ChartLegendIcon from '../atoms/chart-legend-icon';
import { ChartEmptyState } from '../molecules/chart-empty-state';

const COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
];

const renderLegend = (props: any): JSX.Element => {
  const payload = props?.payload ?? [];

  return (
    <ul className="w-full h-fit flex flex-wrap items-center justify-center gap-x-6 gap-y-2 p-0 pt-[20px] pb-[1px] m-0 text-center text-xs capitalize">
      {payload?.map((entry: any, index: number) => {
        const { color } = entry;
        return (
          <li key={`item-${index}`} className="flex items-center gap-x-2">
            <span>
              <ChartLegendIcon color={color ?? '#000'} />
            </span>
            <span className="text-black dark:text-foreground">
              {entry.value}
            </span>
          </li>
        );
      })}
    </ul>
  );
};

export const OrdersByProduct = () => {
  const { data: chartResponse, isLoading } = useGetOrdersChartQuery();

  const { chartData, hasData } = useMemo(() => {
    const rawKindData =
      chartResponse?.data?.charts?.ordersByProductKind?.series?.[0]?.data;

    if (!rawKindData || rawKindData.length === 0) {
      return { chartData: [], hasData: false };
    }

    const processed = rawKindData
      .map((item: any) => ({
        name: item.label, // "Accessory", "Custom", "Fabric", "Non-Custom"
        value: item.value,
      }))
      .filter((d: any) => d.value > 0)
      .sort((a: any, b: any) => b.value - a.value);

    if (processed.length === 0) {
      return { chartData: [], hasData: false };
    }

    return { chartData: processed, hasData: true };
  }, [chartResponse]);

  if (isLoading) {
    return <ChartSkeleton />;
  }

  return (
    <Card className="w-full max-h-fit rounded-[12px] custom-card-shadow">
      <CardHeader className="px-6 pb-4">
        <CardTitle className="text-sm font-medium text-[hsla(210,9%,31%,1)] dark:text-foreground">
          Sales by product kind
        </CardTitle>
      </CardHeader>
      <CardContent className="w-full font-poppins px-3 pt-0 pb-6">
        {/* Same height as the populated chart, so the card doesn't resize
            when data arrives. */}
        <ChartEmptyState
          isEmpty={!hasData}
          variant="pie"
          height={320}
          description="Product type distribution will appear as orders come in"
        >
          {/* 320, not 250: recharts carves the legend out of this height, and
              the pie is a fixed 200px across (outerRadius 100). At 250 a legend
              that wraps to two rows left too little room and clipped the top of
              the donut. */}
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData?.map((entry: any, index: number) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS?.length]}
                    stroke="none"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomChartTooltip />} cursor={false} />
              <Legend
                align="center"
                iconType="circle"
                iconSize={9}
                content={renderLegend}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartEmptyState>
      </CardContent>
    </Card>
  );
};

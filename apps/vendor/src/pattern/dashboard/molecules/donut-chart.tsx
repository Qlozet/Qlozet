'use client';

import { JSX } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomChartTooltip } from './custom-chart-tooltip';
import ChartLegendIcon from '../atoms/chart-legend-icon';

export interface DonutDatum {
  name: string;
  value: number;
}

interface LegendEntry {
  value?: string | number;
  color?: string;
}

interface LegendContentProps {
  payload?: readonly LegendEntry[];
}

const renderLegend = (props: LegendContentProps): JSX.Element => {
  const payload = props?.payload ?? [];
  return (
    <ul className="w-full h-fit flex flex-wrap items-center justify-center gap-x-6 gap-y-2 p-0 pt-[20px] pb-[1px] m-0 text-center text-xs capitalize">
      {payload.map((entry: LegendEntry, index: number) => (
        <li key={`item-${index}`} className="flex items-center gap-x-2">
          <span>
            <ChartLegendIcon color={entry.color ?? '#000'} />
          </span>
          <span className="text-black dark:text-white">{entry.value}</span>
        </li>
      ))}
    </ul>
  );
};

interface DonutChartProps {
  title: string;
  data: DonutDatum[];
  colors: string[];
  className?: string;
  /**
   * Where the legend sits relative to the donut. "bottom" (default) keeps the
   * centered legend used by the dashboard charts; "right" renders the title and
   * a two-column legend grid beside the donut (used by the products stats card).
   */
  legendPosition?: 'bottom' | 'right';
}

// Reusable donut chart (Card + Pie + legend). Backs "Orders by gender",
// "Returns rate", "Orders by product type", etc. so the donut markup lives in
// one place.
export const DonutChart = ({
  title,
  data,
  colors,
  className,
  legendPosition = 'bottom',
}: DonutChartProps) => {
  const sortedData = [...data].sort((a, b) => b.value - a.value);

  if (legendPosition === 'right') {
    return (
      <Card
        className={`h-[120px] w-full rounded-[12px] custom-card-shadow ${className ?? ''}`}
      >
        <CardContent className="flex h-full items-center gap-4 p-3 2xl:p-5">
          <div className="size-[88px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <Pie
                  data={sortedData}
                  cx="50%"
                  cy="50%"
                  innerRadius={23}
                  outerRadius={40}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {sortedData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={colors[index % colors.length]}
                      stroke="none"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomChartTooltip />} cursor={false} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex-1 space-y-3">
            <CardTitle className="text-sm font-medium text-[hsla(210,9%,31%,1)] dark:text-foreground">
              {title}
            </CardTitle>
            <ul className="grid w-fit grid-cols-2 gap-x-10 gap-y-2 p-0 m-0 text-xs capitalize">
              {sortedData.map((entry, index) => (
                <li key={`legend-${index}`} className="flex items-center gap-x-2">
                  <span className="shrink-0">
                    <ChartLegendIcon color={colors[index % colors.length]} />
                  </span>
                  <span className="truncate text-black dark:text-white">
                    {entry.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`w-full rounded-[12px] custom-card-shadow ${className ?? ''}`}>
      <CardHeader className="px-6 pb-4">
        <CardTitle className="text-sm font-medium text-[hsla(210,9%,31%,1)] dark:text-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="w-full px-3 pt-0 pb-6">
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={sortedData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {sortedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} stroke="none" />
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
      </CardContent>
    </Card>
  );
};

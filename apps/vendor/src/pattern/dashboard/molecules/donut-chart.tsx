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
    <ul className='w-full h-fit flex flex-wrap items-center justify-center gap-x-6 gap-y-2 p-0 pt-[20px] pb-[1px] m-0 text-center text-xs capitalize'>
      {payload.map((entry: LegendEntry, index: number) => (
        <li key={`item-${index}`} className='flex items-center gap-x-2'>
          <span>
            <ChartLegendIcon color={entry.color ?? '#000'} />
          </span>
          <span className='text-black dark:text-white'>{entry.value}</span>
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
}

// Reusable donut chart (Card + Pie + legend). Backs "Returns rate" and
// "Orders by product type" so the donut markup lives in one place.
export const DonutChart = ({
  title,
  data,
  colors,
  className,
}: DonutChartProps) => {
  return (
    <Card
      className={`w-full rounded-[12px] custom-card-shadow ${className ?? ''}`}
    >
      <CardHeader className='px-6 pb-4'>
        <CardTitle className='text-sm font-medium text-[hsla(210,9%,31%,1)]'>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className='w-full px-3 pt-0 pb-6'>
        <ResponsiveContainer width='100%' height={250}>
          <PieChart>
            <Pie
              data={data}
              cx='50%'
              cy='50%'
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey='value'
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomChartTooltip />} cursor={false} />
            <Legend
              align='center'
              iconType='circle'
              iconSize={9}
              content={renderLegend}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

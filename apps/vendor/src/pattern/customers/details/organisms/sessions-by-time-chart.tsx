'use client';

import {
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomYAxisTick } from '@/pattern/dashboard/molecules/custom-y-axis-tick';
import { CustomXAxisTick } from '@/pattern/dashboard/molecules/custom-x-axis-tick';

export interface SessionPoint {
  time: string;
  sessions: number;
}

// Charts may use representative sample data when no API backs them (the one
// exception to the no-stubbed-data rule).
const FALLBACK: SessionPoint[] = [
  { time: '12 am', sessions: 13000 },
  { time: '3', sessions: 22000 },
  { time: '5', sessions: 18000 },
  { time: '8', sessions: 20000 },
  { time: '12 pm', sessions: 30000 },
  { time: '3', sessions: 24000 },
  { time: '11', sessions: 50000 },
];

interface SessionsByTimeChartProps {
  data?: SessionPoint[];
}

// "Sessions by Time of Day" area chart for the customer detail analytics row.
// Built from the same axis-tick molecules as the dashboard charts so the
// styling stays consistent.
export const SessionsByTimeChart = ({ data }: SessionsByTimeChartProps) => {
  const chartData = data?.length ? data : FALLBACK;

  return (
    <Card className='w-full max-h-[450px] rounded-[12px] custom-card-shadow'>
      <CardHeader>
        <CardTitle className='text-sm font-medium text-[hsla(210,9%,31%,1)]'>
          Sessions by Time of Day
        </CardTitle>
      </CardHeader>
      <CardContent className='w-full'>
        <ResponsiveContainer width='100%' height={350}>
          <AreaChart
            data={chartData}
            margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id='sessionsFill' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='0%' stopColor='#c4b5a0' stopOpacity={0.7} />
                <stop offset='100%' stopColor='#c4b5a0' stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray='0'
              vertical={false}
              stroke='#e5e7eb'
            />
            <XAxis
              dataKey='time'
              tick={<CustomXAxisTick />}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={<CustomYAxisTick />}
              axisLine={false}
              tickLine={false}
              domain={[0, 60000]}
              ticks={[0, 10000, 20000, 30000, 40000, 50000, 60000]}
            />
            <Area
              type='monotone'
              dataKey='sessions'
              stroke='#8a7060'
              strokeWidth={2}
              fill='url(#sessionsFill)'
              dot={{ stroke: '#8a7060', strokeWidth: 2, fill: '#fff', r: 4 }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

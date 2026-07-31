'use client';

import {
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { AssistantChart } from '@/redux/services/assistant/assistant.api-slice';

const COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-primary)',
];

// Compact chart rendered inline inside an assistant answer bubble. Mirrors the
// dashboard's recharts styling so it feels native to the app.
export const AssistantMiniChart = ({ chart }: { chart: AssistantChart }) => {
  const data = (chart.data ?? []).filter((d) => typeof d.value === 'number');
  if (!data.length) return null;

  return (
    <div className='mt-3 rounded-[12px] border border-border bg-background/60 p-3 dark:bg-[#4A4949]/40'>
      <p className='mb-2 text-xs font-medium text-foreground'>{chart.title}</p>
      <ResponsiveContainer width='100%' height={180}>
        {chart.type === 'pie' ? (
          <PieChart>
            <Pie
              data={data}
              dataKey='value'
              nameKey='label'
              cx='50%'
              cy='50%'
              innerRadius={40}
              outerRadius={70}
              paddingAngle={2}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} stroke='none' />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        ) : chart.type === 'line' ? (
          <LineChart data={data} margin={{ left: -20, right: 8, top: 8 }}>
            <XAxis
              dataKey='label'
              tick={{ fill: 'var(--foreground)', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fill: 'var(--foreground)', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              width={48}
            />
            <Tooltip />
            <Line
              type='monotone'
              dataKey='value'
              stroke='var(--chart-primary)'
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        ) : (
          <BarChart data={data} margin={{ left: -20, right: 8, top: 8 }}>
            <XAxis
              dataKey='label'
              tick={{ fill: 'var(--foreground)', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fill: 'var(--foreground)', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              width={48}
            />
            <Tooltip cursor={false} />
            <Bar dataKey='value' radius={[4, 4, 0, 0]} maxBarSize={36}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

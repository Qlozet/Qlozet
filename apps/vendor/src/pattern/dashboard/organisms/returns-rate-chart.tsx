'use client';

import { DonutChart, type DonutDatum } from '../molecules/donut-chart';

// Charts may use representative sample data when no API backs them (the one
// exception to the no-stubbed-data rule).
const FALLBACK: DonutDatum[] = [
  { name: 'Archived', value: 55 },
  { name: 'Returned', value: 45 },
];

const COLORS = ['var(--chart-primary)', 'var(--chart-secondary)'];

interface ReturnsRateChartProps {
  data?: DonutDatum[];
}

export const ReturnsRateChart = ({ data }: ReturnsRateChartProps) => {
  return (
    <DonutChart
      title='Returns rate'
      data={data?.length ? data : FALLBACK}
      colors={COLORS}
    />
  );
};

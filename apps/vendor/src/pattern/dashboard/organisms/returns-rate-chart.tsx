'use client';

import { DonutChart, type DonutDatum } from '../molecules/donut-chart';

// Charts may use representative sample data when no API backs them (the one
// exception to the no-stubbed-data rule).
const FALLBACK: DonutDatum[] = [
  { name: 'Archived', value: 55 },
  { name: 'Returned', value: 45 },
];

const COLORS = ['#3d2817', '#d4c5b9'];

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

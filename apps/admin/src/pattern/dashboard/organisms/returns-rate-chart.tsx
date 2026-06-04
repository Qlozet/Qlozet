'use client';

import { DonutChart, type DonutDatum } from '../molecules/donut-chart';

const FALLBACK: DonutDatum[] = [
  { name: 'Orders', value: 60 },
  { name: 'Returned', value: 40 },
];

const COLORS = ['#3d2817', '#d4c5b9'];

interface ReturnsRateChartProps {
  data?: DonutDatum[];
}

export const ReturnsRateChart = ({ data }: ReturnsRateChartProps) => {
  return (
    <DonutChart
      title="Returns rate"
      data={data?.length ? data : FALLBACK}
      colors={COLORS}
    />
  );
};

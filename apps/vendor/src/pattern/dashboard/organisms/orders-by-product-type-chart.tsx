'use client';

import { DonutChart, type DonutDatum } from '../molecules/donut-chart';

// Charts may use representative sample data when no API backs them (the one
// exception to the no-stubbed-data rule).
const FALLBACK: DonutDatum[] = [
  { name: 'Custom', value: 30 },
  { name: 'Ready', value: 28 },
  { name: 'Fabrics', value: 22 },
  { name: 'Accessories', value: 20 },
];

const COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)'];

interface OrdersByProductTypeChartProps {
  data?: DonutDatum[];
}

export const OrdersByProductTypeChart = ({
  data,
}: OrdersByProductTypeChartProps) => {
  return (
    <DonutChart
      title='Orders by product type'
      data={data?.length ? data : FALLBACK}
      colors={COLORS}
    />
  );
};

'use client';

import { DonutChart, type DonutDatum } from '../molecules/donut-chart';

const COLORS = ['#3d2817', '#5b4636', '#8a7060', '#d4c5b9'];

interface OrdersByProductTypeChartProps {
  data?: DonutDatum[];
}

// Caller supplies the split. No fallback data: an empty/absent set renders
// DonutChart's empty template rather than an invented product mix.
export const OrdersByProductTypeChart = ({
  data,
}: OrdersByProductTypeChartProps) => (
  <DonutChart
    title="Orders by product type"
    data={data ?? []}
    colors={COLORS}
    emptyDescription="The product-type split will show once orders are categorised."
  />
);

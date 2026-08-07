'use client';

import { DonutChart, type DonutDatum } from '../molecules/donut-chart';

const COLORS = ['#3d2817', '#d4c5b9'];

interface ReturnsRateChartProps {
  data?: DonutDatum[];
}

// Caller supplies the split (see `returnsBreakdown` in lib/dashboard-series).
// No fallback data: an empty/absent set renders DonutChart's empty template
// rather than a fabricated 60/40 return rate.
export const ReturnsRateChart = ({ data }: ReturnsRateChartProps) => (
  <DonutChart
    title="Returns rate"
    data={data ?? []}
    colors={COLORS}
    emptyDescription="Returns will chart here once orders carry refund information."
  />
);

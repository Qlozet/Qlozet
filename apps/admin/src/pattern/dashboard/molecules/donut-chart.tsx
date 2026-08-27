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
import { ChartEmptyState } from './chart-empty-state';
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
  /**
   * Helper text for the empty template. A donut with no slices (or all-zero
   * slices) renders `ChartEmptyState` instead of an empty ring — never a
   * placeholder distribution.
   */
  emptyDescription?: string;
  /**
   * Short line shown in place of the legend when the "right" layout has nothing
   * to plot, e.g. "No sales yet".
   */
  emptyMessage?: string;
}

/**
 * The donut's own outline with nothing in it — one unbroken track ring in the
 * muted colour, at the exact geometry of the real chart (outer 40, inner 23).
 *
 * Drawn as plain SVG rather than a recharts Pie fed a synthetic slice: a fake
 * datum would carry a hover tooltip reading "1", and the ring is the one thing
 * here that must never look like data.
 */
const EmptyDonutRing = () => (
  <svg
    viewBox="0 0 88 88"
    className="size-full"
    role="presentation"
    aria-hidden="true"
  >
    <circle
      cx="44"
      cy="44"
      r="31.5"
      fill="none"
      stroke="var(--muted)"
      strokeWidth="17"
    />
  </svg>
);

/**
 * The legend, empty: the same two-column grid of dot + label the populated
 * chart draws, with the labels as blank muted bars. Keeping the shape means the
 * card reads as "this chart has no data" rather than as a broken or
 * still-loading card, and nothing moves when real data lands.
 */
const EmptyDonutLegend = () => (
  <ul
    className="grid w-fit grid-cols-2 gap-x-10 gap-y-2 p-0 m-0"
    aria-hidden="true"
  >
    {Array.from({ length: 4 }, (_, index) => (
      <li
        key={`legend-placeholder-${index}`}
        className="flex items-center gap-x-2"
      >
        <span className="size-[9px] shrink-0 rounded-full bg-muted" />
        <span className="h-2 w-14 rounded-full bg-muted" />
      </li>
    ))}
  </ul>
);

// Reusable donut chart (Card + Pie + legend). Backs "Orders by gender",
// "Returns rate", "Orders by product type", etc. so the donut markup lives in
// one place.
export const DonutChart = ({
  title,
  data,
  colors,
  className,
  legendPosition = 'bottom',
  emptyDescription,
  emptyMessage = 'No sales yet',
}: DonutChartProps) => {
  const isEmpty =
    data.length === 0 || !data.some((datum) => (datum.value ?? 0) > 0);

  if (legendPosition === 'right') {
    return (
      <Card
        className={`h-[120px] w-full rounded-[12px] custom-card-shadow ${className ?? ''}`}
      >
        <CardContent className="flex h-full items-center gap-4 p-3 2xl:p-5">
          <div className="size-[88px] shrink-0">
            {isEmpty ? (
              <EmptyDonutRing />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={23}
                    outerRadius={40}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={colors[index % colors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomChartTooltip />} cursor={false} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className={isEmpty ? 'flex-1 space-y-2' : 'flex-1 space-y-3'}>
            <CardTitle className="text-sm font-medium text-[hsla(210,9%,31%,1)] dark:text-white">
              {title}
            </CardTitle>

            {isEmpty ? (
              <>
                <p className="text-[11px] leading-none text-muted-foreground">
                  {emptyMessage}
                </p>
                <EmptyDonutLegend />
              </>
            ) : (
              <ul className="grid w-fit grid-cols-2 gap-x-10 gap-y-2 p-0 m-0 text-xs capitalize">
                {data.map((entry, index) => (
                  <li
                    key={`legend-${index}`}
                    className="flex items-center gap-x-2"
                  >
                    <span className="shrink-0">
                      <ChartLegendIcon color={colors[index % colors.length]} />
                    </span>
                    <span className="truncate text-black dark:text-white">
                      {entry.name}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={`w-full max-h-fit rounded-[12px] custom-card-shadow ${className ?? ''}`}
    >
      <CardHeader className="px-6 pb-4">
        <CardTitle className="text-sm font-medium text-[hsla(210,9%,31%,1)] dark:text-white">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="w-full px-3 pt-0 pb-6">
        {/* Same height as the populated chart, so the card doesn't resize
            when data arrives. */}
        <ChartEmptyState
          isEmpty={isEmpty}
          variant="pie"
          height={320}
          description={emptyDescription}
        >
          {/* 320, not 250: recharts carves the legend out of this height, and
              the pie is a fixed 200px across (outerRadius 100). At 250 a legend
              that wraps to two rows left too little room and clipped the top of
              the donut. */}
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
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
                align="center"
                iconType="circle"
                iconSize={9}
                content={renderLegend}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartEmptyState>
      </CardContent>
    </Card>
  );
};

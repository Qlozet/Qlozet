'use client';

import type { ReactNode } from 'react';
import { ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { APP_ROUTES } from '@/lib/routes';
import { MetricCard } from '@/pattern/common/molecules/metric-card';
import { StatsCardSkeleton } from '@/pattern/dashboard/molecules/stats-card-skeleton';
import {
  DonutChart,
  type DonutDatum,
} from '@/pattern/dashboard/molecules/donut-chart';

const showNum = (value: unknown): string =>
  typeof value === 'number' && !Number.isNaN(value)
    ? value.toLocaleString()
    : '—';

const CardIcon = ({ bg, children }: { bg: string; children: ReactNode }) => (
  <div
    className={cn(
      'flex size-12 items-center justify-center rounded-[10px] text-white',
      bg
    )}
  >
    {children}
  </div>
);

const DONUT_COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)'];

interface ProductsStatsProps {
  /** Real total product count from the paginated list response. */
  totalProducts?: number;
  achievedProducts?: number;
  isLoading?: boolean;
  /** Right-hand donut: title + data. Falls back to an even split until the
   * backend supplies a real breakdown. */
  salesTitle: string;
  salesData?: DonutDatum[];
  salesFallback: DonutDatum[];
  /** Link target for the cards' "View All". */
  viewAllLink?: string;
}

// Shared "Total / Achieved products + sales donut" header used by the Clothing,
// Fabric and Accessories catalogue pages — only the donut title/data differ.
export const ProductsStats = ({
  totalProducts,
  achievedProducts,
  isLoading = false,
  salesTitle,
  salesData,
  salesFallback,
  viewAllLink = APP_ROUTES.products,
}: ProductsStatsProps) => {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
      {isLoading ? (
        <>
          <StatsCardSkeleton />
          <StatsCardSkeleton />
        </>
      ) : (
        <>
          <MetricCard
            title="Total products"
            value={showNum(totalProducts)}
            icon={
              <CardIcon bg="bg-[#57CAEB]">
                <ShoppingBag className="size-6" />
              </CardIcon>
            }
            viewAllLink={viewAllLink}
          />
          <MetricCard
            title="Achieved products"
            value={showNum(achievedProducts)}
            icon={
              <CardIcon bg="bg-[#5DDAB4]">
                <ShoppingBag className="size-6" />
              </CardIcon>
            }
            viewAllLink={viewAllLink}
          />
        </>
      )}

      <DonutChart
        title={salesTitle}
        data={salesData?.length ? salesData : salesFallback}
        colors={DONUT_COLORS}
        legendPosition="right"
        className="lg:col-span-2"
      />
    </div>
  );
};

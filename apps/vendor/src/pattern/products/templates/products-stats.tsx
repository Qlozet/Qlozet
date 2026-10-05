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

const DONUT_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
];

interface ProductsStatsProps {
  /** Real total product count from the paginated list response. */
  totalProducts?: number;
  /**
   * Products the vendor has archived. A vendor "delete" is a soft archive, so
   * this is their retired listings rather than a count of nothing.
   */
  archivedProducts?: number;
  isLoading?: boolean;
  /** Right-hand donut: title + the real breakdown. */
  salesTitle: string;
  salesData?: DonutDatum[];
  /** True while the breakdown is still loading. */
  salesLoading?: boolean;
  /** Link target for the cards' "View All". */
  viewAllLink?: string;
}

// Shared "Total / Achieved products + sales donut" header used by the Clothing,
// Fabric and Accessories catalogue pages — only the donut title/data differ.
export const ProductsStats = ({
  totalProducts,
  archivedProducts,
  isLoading = false,
  salesTitle,
  salesData,
  salesLoading = false,
  viewAllLink = APP_ROUTES.products,
}: ProductsStatsProps) => {
  const hasSales = Boolean(salesData?.length);
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
            title="Archived products"
            value={showNum(archivedProducts)}
            icon={
              <CardIcon bg="bg-[#5DDAB4]">
                <ShoppingBag className="size-6" />
              </CardIcon>
            }
            viewAllLink={viewAllLink}
          />
        </>
      )}

      {/* No invented numbers here. A vendor with no sales in the window sees
          that plainly - a donut of placeholder slices reads as real data and
          is worse than an empty card. */}
      {hasSales ? (
        <DonutChart
          title={salesTitle}
          data={salesData as DonutDatum[]}
          colors={DONUT_COLORS}
          legendPosition="right"
          className="lg:col-span-2"
        />
      ) : (
        <div className="flex h-[120px] w-full flex-col justify-center gap-1 rounded-[12px] border bg-card px-5 custom-card-shadow lg:col-span-2">
          <p className="text-sm font-medium text-[hsla(210,9%,31%,1)] dark:text-foreground">
            {salesTitle}
          </p>
          <p className="text-xs text-grey2 dark:text-gray-400">
            {salesLoading
              ? 'Working out your breakdown…'
              : 'No sales in this period yet. This fills in once your products start selling.'}
          </p>
        </div>
      )}
    </div>
  );
};

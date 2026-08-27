'use client';

import type { ReactNode } from 'react';
import { ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { APP_ROUTES } from '@/lib/routes';
import { formatChange } from '@/lib/orders';
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
  /** Total products in this catalogue, from GET /admin/products/stats. */
  totalProducts?: number;
  /** Archived products — the second card in the Figma header. */
  archivedProducts?: number;
  /** 30-day movement for the two cards, from the same response. */
  changes?: {
    total_products?: number | null;
    archived_products?: number | null;
  };
  isLoading?: boolean;
  /** Right-hand donut: title + real sales-by-category data. */
  salesTitle: string;
  salesData?: DonutDatum[];
  /** Link target for the cards' "View All". */
  viewAllLink?: string;
  /** "View All" for the archived card — a pre-filtered link. */
  archivedLink?: string;
}

// Shared "Total / Archived products + sales donut" header used by the Clothing,
// Fabric and Accessories catalogue pages — only the donut title/data differ.
//
// The card the Figma labels "Achieved products" is the archived count; it is
// labelled "Archived" here so the number and its caption agree.
export const ProductsStats = ({
  totalProducts,
  archivedProducts,
  changes,
  isLoading = false,
  salesTitle,
  salesData,
  viewAllLink = APP_ROUTES.products,
  archivedLink,
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
            change={formatChange(changes?.total_products)}
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
            change={formatChange(changes?.archived_products)}
            icon={
              <CardIcon bg="bg-[#5DDAB4]">
                <ShoppingBag className="size-6" />
              </CardIcon>
            }
            viewAllLink={archivedLink ?? viewAllLink}
          />
        </>
      )}

      <DonutChart
        title={salesTitle}
        data={salesData ?? []}
        colors={DONUT_COLORS}
        legendPosition="right"
        className="lg:col-span-2"
      />
    </div>
  );
};

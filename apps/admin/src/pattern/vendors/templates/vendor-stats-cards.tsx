'use client';

import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatChange } from '@/lib/orders';
import { MetricCard } from '@/pattern/common/molecules/metric-card';
import { StatsCardSkeleton } from '@/pattern/dashboard/molecules/stats-card-skeleton';
import type { VendorSummary } from '@/redux/services/businesses/businesses.api-slice';

const formatValue = (value: number | undefined, fallback: string): string =>
  typeof value === 'number' ? value.toLocaleString() : fallback;

const CardIcon = ({ bg }: { bg: string }) => (
  <div
    className={cn(
      'flex size-12 items-center justify-center rounded-[10px] text-white',
      bg
    )}
  >
    <Users className="size-6" />
  </div>
);

interface VendorStatsCardsProps {
  /** Whole-collection counts and 30-day movement from GET /admin/businesses. */
  summary?: VendorSummary;
  /** Row total from the same response, used before `summary` arrives. */
  totalFromList?: number;
  isLoading?: boolean;
}

/**
 * The vendors page's three stat cards.
 *
 * Counts come from the list endpoint's `summary`, which is whole-collection —
 * so the cards do not change as the reader pages through the table or filters
 * it. They previously had no source at all: /admin/dashboard was read here but
 * returns order figures only, so active and inactive were permanently dashed.
 *
 * Active / Inactive use the same status buckets the table's badges do (see
 * `getVendorStatus`), NOT the `is_active` flag — that defaults to true and
 * nothing ever clears it, so it would report every vendor as active while the
 * rows underneath showed them as Inactive.
 */
export const VendorStatsCards = ({
  summary,
  totalFromList,
  isLoading,
}: VendorStatsCardsProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const changes = summary?.changes;
  const total = summary?.total_vendors ?? totalFromList;

  // Vendors in neither bucket — pending and in-review. Surfaced as a sub-label
  // so three cards that do not add up to the total are explained rather than
  // looking like a miscount.
  const awaiting = summary?.awaiting_vendors;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* No viewAllLink: this card sits on the vendors page itself, so the
          link pointed at the page you're already on. */}
      <MetricCard
        title="Total Vendors"
        value={formatValue(total, '—')}
        change={formatChange(changes?.total_vendors)}
        subLabel={awaiting ? `${awaiting} awaiting` : undefined}
        icon={<CardIcon bg="bg-[#57CAEB]" />}
      />
      <MetricCard
        title="Active Vendors"
        value={formatValue(summary?.active_vendors, '—')}
        change={formatChange(changes?.active_vendors)}
        icon={<CardIcon bg="bg-[#5DDAB4]" />}
      />
      <MetricCard
        title="Inactive Vendors"
        value={formatValue(summary?.inactive_vendors, '—')}
        change={formatChange(changes?.inactive_vendors)}
        icon={<CardIcon bg="bg-[#FF8F6B]" />}
      />
    </div>
  );
};

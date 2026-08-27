'use client';

import type { ReactNode } from 'react';
import { Users, MapPin, UserCheck, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatChange } from '@/lib/orders';
import { MetricCard } from '@/pattern/common/molecules/metric-card';
import { StatsCardSkeleton } from '@/pattern/dashboard/molecules/stats-card-skeleton';
import type { CustomerSummary } from '@/redux/services/customers/customers.api-slice';

// Render real values only; a neutral dash when the figure genuinely isn't there.
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

interface CustomerStatsCardsProps {
  /** Whole-collection counts and 30-day movement from GET /admin/customer. */
  summary?: CustomerSummary;
  /** Row total from the same response, used before `summary` arrives. */
  totalFromList?: number;
  isLoading?: boolean;
}

/**
 * The customers page's four stat cards.
 *
 * All four now come from the list endpoint's `summary`, which is
 * whole-collection — so they do not move as the reader searches or pages the
 * table. Three of them previously had no source at all: this read
 * /admin/dashboard, which carries a customer COUNT and nothing else, so
 * location, unique customers and the favourite were permanently dashed.
 *
 * "Unique" means customers who have actually ordered, as against the registered
 * accounts in "Total". Location is the busiest shipping state counted by
 * DISTINCT customers, so one person ordering ten times does not carry their
 * state to the top.
 */
export const CustomerStatsCards = ({
  summary,
  totalFromList,
  isLoading,
}: CustomerStatsCardsProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const changes = summary?.changes;
  const total = summary?.total_customers ?? totalFromList;
  const location = summary?.top_location;
  const favourite = summary?.favourite_product;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Total Customers"
        value={showNum(total)}
        change={formatChange(changes?.total_customers)}
        icon={
          <CardIcon bg="bg-[#57CAEB]">
            <Users className="size-6" />
          </CardIcon>
        }
      />
      <MetricCard
        title="Highest customer by location"
        value={location?.label ?? '—'}
        // A place name, not a figure — the numeric size overflows the card.
        valueClassName="text-base leading-snug line-clamp-2 break-words"
        subLabel={
          location
            ? `${location.customers.toLocaleString()} customers`
            : undefined
        }
        // No change badge: a percentage movement on a place NAME is meaningless.
        icon={
          <CardIcon bg="bg-[#5DDAB4]">
            <MapPin className="size-6" />
          </CardIcon>
        }
      />
      <MetricCard
        title="Unique Customers"
        value={showNum(summary?.unique_customers)}
        change={formatChange(changes?.unique_customers)}
        subLabel="have ordered"
        icon={
          <CardIcon bg="bg-[#FF8F6B]">
            <UserCheck className="size-6" />
          </CardIcon>
        }
      />
      <MetricCard
        title="Customer favorite"
        value={favourite?.name ?? '—'}
        // A product name, same treatment as the location card.
        valueClassName="text-base leading-snug line-clamp-2 break-words"
        subLabel={
          favourite ? `${favourite.units.toLocaleString()} ordered` : undefined
        }
        icon={
          <CardIcon bg="bg-[#FFB74A]">
            <Heart className="size-6" />
          </CardIcon>
        }
      />
    </div>
  );
};

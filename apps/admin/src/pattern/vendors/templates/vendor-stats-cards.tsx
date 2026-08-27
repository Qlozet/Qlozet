'use client';

import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { periodChangeLabel } from '@/lib/metric-change';
import { MetricCard } from '@/pattern/common/molecules/metric-card';
import { StatsCardSkeleton } from '@/pattern/dashboard/molecules/stats-card-skeleton';
import { useGetNewVendorsThisWeekQuery } from '@/redux/services/users/users.api-slice';

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
  /** Total vendor count from the paginated list, used as a fallback. */
  totalFromList?: number;
}

export const VendorStatsCards = ({ totalFromList }: VendorStatsCardsProps) => {
  // /admin/dashboard used to be read here, but it returns order figures only —
  // no vendor counts — so every value it supplied was undefined. The vendors
  // list total is the real source.
  //
  // Real week-over-week movement: /users/vendors/new-week returns the vendors
  // onboarded this week, so the total's growth can be derived from it. There is
  // no equivalent source for the active/inactive splits, so those cards show no
  // change widget rather than an invented one.
  const { data: newThisWeekData, isLoading } = useGetNewVendorsThisWeekQuery();
  const newThisWeek = Array.isArray(newThisWeekData?.data)
    ? newThisWeekData.data.length
    : undefined;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const total = totalFromList;
  // No endpoint exposes the active/inactive split yet, so these stay dashed
  // rather than showing an invented figure.
  const active: number | undefined = undefined;
  const inactive: number | undefined = undefined;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* No viewAllLink: this card sits on the vendors page itself, so the
          link pointed at the page you're already on. */}
      <MetricCard
        title="Total Vendors"
        value={formatValue(total, '—')}
        change={periodChangeLabel(total, newThisWeek)}
        subLabel={newThisWeek ? 'vs last week' : undefined}
        icon={<CardIcon bg="bg-[#57CAEB]" />}
      />
      <MetricCard
        title="Active Vendors"
        value={formatValue(active, '—')}
        icon={<CardIcon bg="bg-[#5DDAB4]" />}
      />
      <MetricCard
        title="Inactive Vendors"
        value={formatValue(inactive, '—')}
        icon={<CardIcon bg="bg-[#5DDAB4]" />}
      />
    </div>
  );
};

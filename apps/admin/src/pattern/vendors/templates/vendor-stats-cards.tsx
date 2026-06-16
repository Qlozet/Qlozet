'use client';

import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { APP_ROUTES } from '@/lib/routes';
import { MetricCard } from '@/pattern/common/molecules/metric-card';
import { StatsCardSkeleton } from '@/pattern/dashboard/molecules/stats-card-skeleton';
import { useGetAdminDashboardQuery } from '@/redux/services/dashboard/dashboard.api-slice';

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
  const { data, isLoading } = useGetAdminDashboardQuery();
  const metrics = data?.data;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const total = metrics?.totalVendors ?? totalFromList;
  const active = metrics?.activeVendors ?? metrics?.verifiedVendors;
  const inactive =
    metrics?.inactiveVendors ??
    (typeof total === 'number' && typeof active === 'number'
      ? Math.max(total - active, 0)
      : undefined);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <MetricCard
        title="Total Vendors"
        value={formatValue(total, '—')}
        icon={<CardIcon bg="bg-[#57CAEB]" />}
        viewAllLink={APP_ROUTES.vendors}
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

'use client';

import type { ReactNode } from 'react';
import { Users, MapPin, UserCheck, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { APP_ROUTES } from '@/lib/routes';
import { MetricCard } from '@/pattern/common/molecules/metric-card';
import { StatsCardSkeleton } from '@/pattern/dashboard/molecules/stats-card-skeleton';
import { useGetAdminDashboardQuery } from '@/redux/services/dashboard/dashboard.api-slice';

// Render real values only; show a neutral dash when the backend hasn't supplied
// the metric (no stubbed/placeholder numbers).
const showNum = (value: unknown): string =>
  typeof value === 'number' && !Number.isNaN(value)
    ? value.toLocaleString()
    : '—';

const showStr = (value: unknown): string =>
  typeof value === 'string' && value.trim().length > 0 ? value : '—';

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
  /** Real total customer count from the paginated list response. */
  totalFromList?: number;
}

export const CustomerStatsCards = ({
  totalFromList,
}: CustomerStatsCardsProps) => {
  const { data, isLoading } = useGetAdminDashboardQuery();
  const metrics = data?.data;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const m = (metrics ?? {}) as Record<string, unknown>;
  // Total comes from the real customers list count, preferring the dashboard
  // metric when the backend exposes it.
  const total =
    typeof metrics?.totalCustomers === 'number'
      ? metrics.totalCustomers
      : totalFromList;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Total Customers"
        value={showNum(total)}
        icon={
          <CardIcon bg="bg-[#57CAEB]">
            <Users className="size-6" />
          </CardIcon>
        }
        viewAllLink={APP_ROUTES.customers}
      />
      <MetricCard
        title="Highest customer by location"
        value={showStr(m.topCustomerLocation)}
        icon={
          <CardIcon bg="bg-[#5DDAB4]">
            <MapPin className="size-6" />
          </CardIcon>
        }
      />
      <MetricCard
        title="Unique Customers"
        value={showNum(m.uniqueCustomers)}
        icon={
          <CardIcon bg="bg-[#FF8F6B]">
            <UserCheck className="size-6" />
          </CardIcon>
        }
        viewAllLink={APP_ROUTES.customers}
      />
      <MetricCard
        title="Customer favorite"
        value={showStr(m.customerFavorite)}
        icon={
          <CardIcon bg="bg-[#FFB200]">
            <Heart className="size-6" />
          </CardIcon>
        }
      />
    </div>
  );
};

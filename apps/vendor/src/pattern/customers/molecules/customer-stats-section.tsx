'use client';

// Customer Stats Section - Molecule
// The four headline metric cards above the customers table. Total Customers is
// the real count from GET /business/customers; top location, repeat customers
// and the customer favourite come from GET /business/customers/demographics
// (the same cached query the charts below use). Before there is data a card
// shows a neutral dash, never a made-up value (see [[no-stubbed-data]]).

import React, { ReactNode } from 'react';
import Link from 'next/link';
import { Users, MapPin, Repeat, Heart, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { If } from '@/pattern/common/atoms/If';
import { StatsCardSkeleton } from '@/pattern/dashboard/molecules/stats-card-skeleton';
import { useGetCustomerDemographicsQuery } from '@/redux/services/customers/customers.api-slice';

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

interface MetricCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  viewAllLink?: string;
  /** A short line under the value, e.g. "12 customers". */
  hint?: string;
}

const MetricCard = ({
  title,
  value,
  icon,
  viewAllLink,
  hint,
}: MetricCardProps) => (
  <Card className="h-[120px] p-3 2xl:p-5 rounded-[12px] custom-card-shadow">
    <CardContent className="h-full p-0">
      <div className="flex items-start justify-start gap-x-4">
        <div className="shrink-0">{icon}</div>
        <div className="flex-1 space-y-2">
          <p className="text-[hsla(210,9%,31%,1)] dark:text-white text-xs font-normal">
            {title}
          </p>
          <p
            className="text-2xl font-bold text-[hsla(210,9%,31%,1)] dark:text-white truncate"
            title={value}
          >
            {value}
          </p>
          <If isTrue={Boolean(hint)}>
            <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
              {hint}
            </p>
          </If>
          <If isTrue={Boolean(viewAllLink)}>
            <Link
              href={viewAllLink ?? '#'}
              className="flex items-center gap-x-1 text-success dark:text-gray-400 text-xs whitespace-nowrap"
            >
              <Eye className="size-3.5" />
              <span>View All</span>
            </Link>
          </If>
        </div>
      </div>
    </CardContent>
  </Card>
);

interface CustomerStatsSectionProps {
  /** Total customer count from the paginated response. */
  total?: number;
  isLoading?: boolean;
  /**
   * Anchor the "View All" links scroll to (the customers table). These cards
   * live on the customers page itself, so linking to /customers was a no-op.
   */
  tableHref?: string;
}

export const CustomerStatsSection: React.FC<CustomerStatsSectionProps> = ({
  total,
  isLoading = false,
  tableHref = '#customers-table',
}) => {
  const { data: demo, isLoading: demoLoading } =
    useGetCustomerDemographicsQuery();

  if (isLoading || demoLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const plural = (n: number, word: string) =>
    `${n.toLocaleString()} ${word}${n === 1 ? '' : 's'}`;

  const top = (demo?.topLocations ?? []).find(
    (l) => l.customerCount > 0 && l.location && l.location !== 'Unknown'
  );
  const repeat = demo?.repeatCustomers ?? 0;
  const base = demo?.totalCustomers ?? 0;
  const fav = demo?.favoriteProduct ?? null;

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
        viewAllLink={tableHref}
      />
      <MetricCard
        title="Top location"
        value={top ? String(top.location) : '—'}
        hint={top ? plural(top.customerCount, 'customer') : undefined}
        icon={
          <CardIcon bg="bg-[#5DDAB4]">
            <MapPin className="size-6" />
          </CardIcon>
        }
      />
      <MetricCard
        title="Repeat customers"
        value={base > 0 ? repeat.toLocaleString() : '—'}
        hint={
          base > 0
            ? `${Math.round((repeat / base) * 100)}% ordered more than once`
            : undefined
        }
        icon={
          <CardIcon bg="bg-[#FF8F6B]">
            <Repeat className="size-6" />
          </CardIcon>
        }
      />
      <MetricCard
        title="Customer favorite"
        value={fav ? fav.name : '—'}
        hint={fav ? `In ${plural(fav.orders, 'order')}` : undefined}
        icon={
          <CardIcon bg="bg-[#FFB200]">
            <Heart className="size-6" />
          </CardIcon>
        }
      />
    </div>
  );
};

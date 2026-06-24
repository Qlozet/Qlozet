'use client';

// Customer Stats Section - Molecule
// The four headline metric cards above the customers table. Total Customers is
// the real count from GET /business/customers; the location / unique-customers /
// favourite metrics aren't provided by that endpoint, so they show a neutral
// dash rather than a fabricated value (see [[no-stubbed-data]]).

import React, { ReactNode } from 'react';
import Link from 'next/link';
import { Users, MapPin, UserCheck, Heart, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { APP_ROUTES } from '@/lib/routes';
import { If } from '@/pattern/common/atoms/If';
import { StatsCardSkeleton } from '@/pattern/dashboard/molecules/stats-card-skeleton';

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
}

const MetricCard = ({ title, value, icon, viewAllLink }: MetricCardProps) => (
  <Card className='h-[120px] p-3 2xl:p-5 rounded-[12px] custom-card-shadow'>
    <CardContent className='h-full p-0'>
      <div className='flex items-start justify-start gap-x-4'>
        <div className='shrink-0'>{icon}</div>
        <div className='flex-1 space-y-2'>
          <p className='text-[hsla(210,9%,31%,1)] dark:text-white text-xs font-normal'>
            {title}
          </p>
          <p className='text-2xl font-bold text-[hsla(210,9%,31%,1)] dark:text-white truncate'>
            {value}
          </p>
          <If isTrue={Boolean(viewAllLink)}>
            <Link
              href={viewAllLink ?? '#'}
              className='flex items-center gap-x-1 text-success dark:text-gray-400 text-xs whitespace-nowrap'
            >
              <Eye className='size-3.5' />
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
}

export const CustomerStatsSection: React.FC<CustomerStatsSectionProps> = ({
  total,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
      <MetricCard
        title='Total Customers'
        value={showNum(total)}
        icon={
          <CardIcon bg='bg-[#57CAEB]'>
            <Users className='size-6' />
          </CardIcon>
        }
        viewAllLink={APP_ROUTES.customers}
      />
      <MetricCard
        title='Highest customer by location'
        value='—'
        icon={
          <CardIcon bg='bg-[#5DDAB4]'>
            <MapPin className='size-6' />
          </CardIcon>
        }
      />
      <MetricCard
        title='Unique Customers'
        value='—'
        icon={
          <CardIcon bg='bg-[#FF8F6B]'>
            <UserCheck className='size-6' />
          </CardIcon>
        }
        viewAllLink={APP_ROUTES.customers}
      />
      <MetricCard
        title='Customer favorite'
        value='—'
        icon={
          <CardIcon bg='bg-[#FFB200]'>
            <Heart className='size-6' />
          </CardIcon>
        }
      />
    </div>
  );
};

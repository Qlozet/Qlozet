'use client';

import type { ReactNode } from 'react';
import { ArrowUp, ArrowDown, Eye } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { If } from '@/pattern/common/atoms/If';

export interface MetricCardProps {
  title: string;
  value: string;
  /** Percentage change label, e.g. "2.5%". Prefix with "-" for a negative trend. */
  change?: string;
  icon: ReactNode;
  /** Small muted label shown to the right of the title (e.g. a date). */
  subLabel?: string;
  /** When set, renders a "View All" link in the footer. */
  viewAllLink?: string;
  className?: string;
}

// Shared metric/stat card used across the customer detail (wallet) and stats
// sections so they don't each reimplement the same card.
export const MetricCard = ({
  title,
  value,
  change,
  icon,
  subLabel,
  viewAllLink,
  className,
}: MetricCardProps) => {
  const isPositive = !change?.startsWith('-');

  return (
    <Card
      className={cn(
        'h-[120px] p-3 2xl:p-5 rounded-[12px] custom-card-shadow',
        className
      )}
    >
      <CardContent className='h-full p-0'>
        <div className='flex items-start justify-start gap-x-4'>
          <div className='shrink-0'>{icon}</div>

          <div className='flex-1 space-y-2'>
            <div className='space-y-2'>
              <div className='flex items-center justify-between gap-2'>
                <p className='text-[hsla(210,9%,31%,1)] dark:text-white text-xs font-normal'>
                  {title}
                </p>
                <If isTrue={Boolean(subLabel)}>
                  <span className='text-[11px] text-muted-foreground whitespace-nowrap'>
                    {subLabel}
                  </span>
                </If>
              </div>
              <p className='text-2xl font-bold text-[hsla(210,9%,31%,1)] dark:text-white truncate'>
                {value}
              </p>
            </div>

            <div className='w-full flex items-center justify-between'>
              <If isTrue={Boolean(change)}>
                <p
                  className={cn(
                    'flex items-center gap-x-1 text-sm',
                    isPositive
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-destructive dark:text-red-400'
                  )}
                >
                  <span>{change}</span>
                  {isPositive ? (
                    <ArrowUp className='size-3' />
                  ) : (
                    <ArrowDown className='size-3' />
                  )}
                </p>
              </If>

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
        </div>
      </CardContent>
    </Card>
  );
};

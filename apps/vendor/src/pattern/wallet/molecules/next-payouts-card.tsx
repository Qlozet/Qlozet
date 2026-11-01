'use client';

// "Next payouts": the money behind Pending Earnings, one row per payment,
// soonest first. Each lands in the wallet balance 14 days after the customer
// paid (the backend's settlement date); a refund or penalty before then
// lowers or removes the row.

import React from 'react';
import { CalendarClock } from 'lucide-react';
import { useGetUpcomingEarningsQuery } from '@/redux/services/business/business.api-slice';
import { formatNaira } from '../lib/transaction-fields';

const SHOWN = 5;

const formatPayoutDate = (value?: string): string => {
  if (!value) return 'Date to come';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'Date to come';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const day = new Date(d);
  day.setHours(0, 0, 0, 0);
  const days = Math.round((day.getTime() - today.getTime()) / 86_400_000);
  const label = d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });
  if (days <= 0) return `${label} · today`;
  if (days === 1) return `${label} · tomorrow`;
  return `${label} · in ${days} days`;
};

const MILESTONE_LABEL: Record<string, string> = {
  upfront: 'Deposit',
  balance: 'Balance',
  cancellation_fee: 'Cancellation fee',
};

export const NextPayoutsCard: React.FC = () => {
  const { data, isLoading, isError } = useGetUpcomingEarningsQuery({
    size: SHOWN,
  });
  const rows = data?.rows ?? [];
  const more = Math.max(0, (data?.totalCount ?? 0) - rows.length);

  return (
    <div className="bg-card w-full rounded-xl border custom-card-shadow p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold">Next payouts</h3>
          <p className="text-muted-foreground text-xs">
            Each payment reaches your wallet balance 14 days after the customer
            pays.
          </p>
        </div>
        {typeof data?.totalAmount === 'number' && data.totalAmount > 0 && (
          <p className="text-sm font-semibold tabular-nums">
            {formatNaira(data.totalAmount)}
            <span className="text-muted-foreground ml-1 text-xs font-normal">
              on the way
            </span>
          </p>
        )}
      </div>

      <div className="mt-4">
        {isLoading ? (
          <div className="space-y-2" aria-busy="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="bg-muted h-10 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : isError ? (
          <p className="text-muted-foreground text-sm">
            Upcoming payouts could not be loaded. Refresh to try again.
          </p>
        ) : rows.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Nothing on the way. Money from new orders shows here until it
            reaches your balance.
          </p>
        ) : (
          <ul className="divide-y">
            {rows.map((row, i) => {
              const tag = row.milestone ? MILESTONE_LABEL[row.milestone] : '';
              return (
                <li
                  key={row._id ?? i}
                  className="flex items-center justify-between gap-3 py-2.5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="bg-muted text-muted-foreground flex size-8 shrink-0 items-center justify-center rounded-lg">
                      <CalendarClock className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {formatPayoutDate(row.date)}
                      </p>
                      <p className="text-muted-foreground truncate text-xs">
                        {row.order_reference
                          ? `Order ${row.order_reference}`
                          : 'Order'}
                        {tag ? ` · ${tag}` : ''}
                      </p>
                    </div>
                  </div>
                  <p className="shrink-0 text-sm font-semibold tabular-nums">
                    {formatNaira(row.amount)}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
        {more > 0 && (
          <p className="text-muted-foreground mt-2 text-xs">
            And {more} more after these.
          </p>
        )}
      </div>
    </div>
  );
};

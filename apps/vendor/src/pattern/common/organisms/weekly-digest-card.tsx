'use client';

import { FC } from 'react';
import Link from 'next/link';
import { X, ChevronRight, Sparkles } from 'lucide-react';
import { APP_ROUTES } from '@/lib/routes';
import type { WeeklyDigest } from '@/redux/services/assistant/assistant.api-slice';

// Map a recommendation's action hint to an in-app route so it becomes a task.
const ACTION_ROUTE: Record<string, string> = {
  inventory: APP_ROUTES.products,
  orders: APP_ROUTES.orders,
  promotions: APP_ROUTES.productsDiscounts,
  earnings: APP_ROUTES.wallet,
};

interface Props {
  digest: WeeklyDigest;
  /** Dismiss = mark the digest read. */
  onDismiss: () => void;
}

const WeeklyDigestCard: FC<Props> = ({ digest, onDismiss }) => {
  return (
    <div
      className='fixed bottom-4 right-4 z-[10000] max-w-sm rounded-xl border border-border bg-white shadow-lg dark:bg-card'
      role='status'
      aria-live='polite'
    >
      <div className='flex items-start gap-3 p-4'>
        <span className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10'>
          <Sparkles className='h-4 w-4 text-primary' />
        </span>

        <div className='min-w-0 flex-1'>
          <h4 className='mb-1 text-sm font-medium text-foreground'>
            Your weekly digest
          </h4>
          <p className='text-xs leading-relaxed text-muted-foreground'>
            {digest.summary}
          </p>

          {digest.recommendations?.length > 0 && (
            <div className='mt-2 space-y-1'>
              {digest.recommendations.slice(0, 3).map((r, i) => {
                const route = ACTION_ROUTE[r.action];
                const inner = (
                  <>
                    <span className='truncate'>{r.label}</span>
                    {route && <ChevronRight size={13} className='shrink-0' />}
                  </>
                );
                return route ? (
                  <Link
                    key={i}
                    href={route}
                    onClick={onDismiss}
                    className='flex items-center justify-between gap-1 rounded-lg bg-muted/60 px-2 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted dark:bg-[#4A4949]/50'
                  >
                    {inner}
                  </Link>
                ) : (
                  <div
                    key={i}
                    className='rounded-lg bg-muted/60 px-2 py-1.5 text-xs text-foreground dark:bg-[#4A4949]/50'
                  >
                    {r.label}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <button
          className='flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-muted transition-colors hover:bg-muted/80'
          onClick={onDismiss}
          aria-label='Dismiss digest'
        >
          <X size={12} className='text-muted-foreground' />
        </button>
      </div>
    </div>
  );
};

export default WeeklyDigestCard;

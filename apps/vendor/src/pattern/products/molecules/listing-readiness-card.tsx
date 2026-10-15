'use client';

import { CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Readiness } from '../lib/listing-readiness';

interface ListingReadinessCardProps {
  readiness: Readiness;
  className?: string;
}

/**
 * The publish rules as a live progress list. Every line is one thing the
 * server would otherwise reject the listing for after the vendor pressed
 * Publish; here it turns green as they go, and Publish only enables when
 * the list is green. Drafts are never gated.
 */
export const ListingReadinessCard = ({
  readiness,
  className,
}: ListingReadinessCardProps) => (
  <div className={cn('surface-card p-6', className)}>
    <div className="mb-3 flex items-center justify-between">
      <span className="text-sm font-semibold text-grey-black dark:text-white">
        Ready to publish?
      </span>
      <span
        className={cn(
          'text-xs font-medium tabular-nums',
          readiness.ready ? 'text-emerald-600' : 'text-muted-foreground'
        )}
      >
        {readiness.done} of {readiness.total}
      </span>
    </div>
    <ul className="space-y-2">
      {readiness.items.map((item) => (
        <li
          key={item.key}
          className={cn(
            'flex items-start gap-2 text-sm',
            item.ok ? 'text-muted-foreground' : 'text-foreground'
          )}
        >
          {item.ok ? (
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
          ) : (
            <Circle className="mt-0.5 size-4 shrink-0 text-muted-foreground/60" />
          )}
          <span
            className={cn(
              item.ok && 'line-through decoration-muted-foreground/40'
            )}
          >
            {item.label}
          </span>
        </li>
      ))}
    </ul>
    <p className="mt-3 text-xs text-muted-foreground">
      You can save a draft at any point. Published listings go live after a
      quick review by Qlozet.
    </p>
  </div>
);

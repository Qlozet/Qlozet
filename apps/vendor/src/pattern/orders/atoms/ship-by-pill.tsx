'use client';

import { cn } from '@/lib/utils';
import { useNow } from '@/lib/hooks/useNow';
import {
  SHIP_BY_TONE_CLASS,
  latePreviewLines,
  shipByBadge,
} from '../lib/late-preview';
import type { Order } from '@/redux/services/orders/orders.api-slice';

/**
 * The ship-by date for an order this store has confirmed but not shipped:
 * amber within 2 days, red once late. A dash for anything else.
 */
export function ShipByPill({ order }: { order: Order }) {
  const now = useNow();
  const badge = shipByBadge(order.late_preview, now);
  if (!badge)
    return <span className="text-sm text-grey2 dark:text-gray-400">—</span>;
  return (
    <span
      title={latePreviewLines(order.late_preview).join(' ')}
      className={cn(
        'inline-flex h-[26px] items-center justify-center whitespace-nowrap rounded-[8px] px-3 text-xs font-medium',
        SHIP_BY_TONE_CLASS[badge.tone]
      )}
    >
      {badge.label}
    </span>
  );
}

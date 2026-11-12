'use client';

import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNow } from '@/lib/hooks/useNow';
import { deliveryBadge, readStatus } from '../lib/order-fields';
import { CONFIRM_TONE_CLASS, confirmCountdown } from '../lib/confirm-countdown';
import type { Order } from '@/redux/services/orders/orders.api-slice';

/**
 * The order's status pill. While the order waits for this store to confirm,
 * it shows how long is left before it cancels itself instead of "In Review".
 */
export function OrderStatusPill({ order }: { order: Order }) {
  const now = useNow();
  const status = readStatus(order);
  const countdown =
    status === 'in_review' ? confirmCountdown(order.confirm_by, now) : null;

  if (countdown) {
    return (
      <span
        title={`Confirm or decline by ${countdown.at}, or the order is cancelled and the customer refunded.`}
        className={cn(
          'inline-flex h-[26px] items-center justify-center gap-1 whitespace-nowrap rounded-[8px] px-3 text-xs font-medium',
          CONFIRM_TONE_CLASS[countdown.tone]
        )}
      >
        <Clock className="size-3" aria-hidden />
        {countdown.tone === 'overdue'
          ? 'Cancelling'
          : `Confirm in ${countdown.left}`}
      </span>
    );
  }

  const badge = deliveryBadge(status);
  return (
    <span
      className={cn(
        'inline-flex h-[26px] items-center justify-center whitespace-nowrap rounded-[8px] px-3 text-xs font-medium',
        badge.className
      )}
    >
      {badge.label}
    </span>
  );
}

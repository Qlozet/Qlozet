'use client';

import { toast } from 'sonner';
import {
  AlarmClock,
  AlertTriangle,
  CircleX,
  MessageSquareWarning,
  RotateCcw,
  Scissors,
  Truck,
  Undo2,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useAcknowledgeOrderRulesMutation,
  useGetOrderRulesQuery,
} from '@/redux/services/verification/verification.api-slice';
import { readApiError } from '@/redux/services/types';
import { formatLongDate } from './verification-status';

const ICONS: Record<string, LucideIcon> = {
  confirm: AlarmClock,
  ship_by: Truck,
  late: AlertTriangle,
  abandon: CircleX,
  payout: Wallet,
  bespoke: Scissors,
  customer_cancel: Undo2,
  returns: RotateCcw,
  disputes: MessageSquareWarning,
};

/**
 * "How orders work": the order rules, one card each, and the tick that says
 * the vendor understood them.
 *
 * The cards and their numbers come from the backend (business/order-rules.ts),
 * built from the same settings the order jobs run on, so this page cannot
 * promise something the platform does not do. The tick is recorded with the
 * version shown; if a rule changes, the vendor is asked again.
 */
export const OrderRulesPanel = () => {
  const { data, isLoading } = useGetOrderRulesQuery();
  const [acknowledge, { isLoading: isSaving }] =
    useAcknowledgeOrderRulesMutation();
  const rules = data?.data;
  const acknowledgedOn = formatLongDate(rules?.acknowledged_at);

  const onTick = async () => {
    if (!rules?.version) return;
    try {
      await acknowledge({ version: rules.version }).unwrap();
      toast.success('Saved. You know how orders work.');
    } catch (err) {
      toast.error(readApiError(err, 'Could not save that. Try again.'));
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-[#F8F9FA] dark:bg-muted/40">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
          <span className="text-xs font-semibold text-grey-black dark:text-white">
            How orders work
          </span>
          <span className="shrink-0 text-[11px] text-grey2 dark:text-gray-400">
            The rules every order follows
          </span>
        </div>

        {isLoading ? (
          <div className="space-y-2 px-4 py-3">
            <Skeleton className="h-3 w-3/4 rounded" />
            <Skeleton className="h-3 w-full rounded" />
            <Skeleton className="h-3 w-5/6 rounded" />
          </div>
        ) : rules?.cards?.length ? (
          <ul className="grid gap-px overflow-hidden bg-border sm:grid-cols-2">
            {rules.cards.map((card) => {
              const Icon = ICONS[card.key] ?? AlarmClock;
              return (
                <li
                  key={card.key}
                  className="flex items-start gap-3 bg-[#F8F9FA] px-4 py-3 dark:bg-card"
                >
                  <Icon
                    className="mt-0.5 size-4 shrink-0 text-brown3"
                    aria-hidden
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-grey-black dark:text-white">
                      {card.title}
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-grey2 dark:text-gray-400">
                      {card.body}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="px-4 py-3 text-xs text-grey2 dark:text-gray-400">
            The rules could not be loaded. Reload the page.
          </p>
        )}
      </div>

      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          className="mt-0.5 size-4 shrink-0 cursor-pointer accent-primary"
          checked={Boolean(rules?.acknowledged)}
          // A record, not a toggle, like the agreement box.
          disabled={
            Boolean(rules?.acknowledged) || isSaving || !rules?.cards?.length
          }
          onChange={(e) => {
            if (e.target.checked) onTick();
          }}
        />
        <span className="text-xs leading-relaxed text-grey2 dark:text-gray-400">
          I understand how orders work
          {rules?.acknowledged && acknowledgedOn && (
            <span className="ml-1">(saved {acknowledgedOn})</span>
          )}
          {!rules?.acknowledged && rules?.acknowledged_at && (
            <span className="ml-1 font-medium text-amber-600 dark:text-amber-400">
              (a rule changed since you last read these, please read them again)
            </span>
          )}
        </span>
      </label>
    </div>
  );
};

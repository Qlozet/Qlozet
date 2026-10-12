'use client';

import { useState } from 'react';
import {
  BadgeCheck,
  CheckCircle2,
  Clock,
  Gavel,
  Loader2,
  MessageSquareReply,
  PackageCheck,
  PackageX,
  Store,
  UserCheck,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  useCancelAssistantActionMutation,
  useConfirmAssistantActionMutation,
  type AssistantAction,
} from '@/redux/services/assistant/assistant.api-slice';

const KIND: Record<string, { label: string; Icon: typeof PackageCheck }> = {
  approve_product: { label: 'Approve product', Icon: PackageCheck },
  reject_product: { label: 'Reject product', Icon: PackageX },
  decide_vendor_application: { label: 'Vendor application', Icon: Store },
  assign_ticket: { label: 'Assign ticket', Icon: UserCheck },
  reply_to_ticket: { label: 'Reply to ticket', Icon: MessageSquareReply },
  resolve_dispute: { label: 'Resolve dispute', Icon: Gavel },
};

const STATUS: Record<
  AssistantAction['status'],
  { label: string; className: string; Icon: typeof CheckCircle2 }
> = {
  proposed: {
    label: 'Waiting for you',
    className: 'text-amber-700 dark:text-amber-300',
    Icon: Clock,
  },
  executed: {
    label: 'Done',
    className: 'text-emerald-700 dark:text-emerald-300',
    Icon: CheckCircle2,
  },
  failed: {
    label: 'Failed',
    className: 'text-red-700 dark:text-red-300',
    Icon: XCircle,
  },
  cancelled: {
    label: 'Dismissed',
    className: 'text-muted-foreground',
    Icon: XCircle,
  },
  expired: {
    label: 'Expired',
    className: 'text-muted-foreground',
    Icon: Clock,
  },
};

interface Props {
  action: AssistantAction;
  onChange: (updated: AssistantAction) => void;
}

/**
 * An action the assistant PREPARED, shown under its answer. Nothing has
 * happened yet: the Confirm tap here is the only thing that executes it, and
 * the server re-checks everything the console would. The card then shows the
 * outcome and stays in the thread as the record of who decided what.
 */
export const AssistantActionCard = ({ action, onChange }: Props) => {
  const [confirm, { isLoading: confirming }] =
    useConfirmAssistantActionMutation();
  const [cancel, { isLoading: cancelling }] =
    useCancelAssistantActionMutation();
  const [busy, setBusy] = useState<'confirm' | 'cancel' | null>(null);

  const kind = KIND[action.kind] ?? { label: action.kind, Icon: BadgeCheck };
  const status = STATUS[action.status] ?? STATUS.proposed;
  const open = action.status === 'proposed';
  const isBusy = confirming || cancelling;

  const decide = async (what: 'confirm' | 'cancel') => {
    if (isBusy) return;
    setBusy(what);
    try {
      const res = await (
        what === 'confirm'
          ? confirm(action.action_id)
          : cancel(action.action_id)
      ).unwrap();
      const updated = res?.data ?? (res as unknown as AssistantAction);
      onChange(updated);
      if (what === 'confirm') {
        if (updated.status === 'executed')
          toast.success(updated.result_text ?? 'Done');
        else toast.error(updated.error ?? 'That did not go through');
      }
    } catch (e: any) {
      const message =
        e?.data?.message ?? 'Could not reach the server. Try again.';
      toast.error(message);
      if (/expired/i.test(message)) onChange({ ...action, status: 'expired' });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div
      className={cn(
        'mt-3 w-full rounded-xl border bg-background p-3 text-left text-foreground shadow-sm',
        open ? 'border-primary/40' : 'border-border'
      )}
      role="group"
      aria-label={kind.label}
    >
      <div className="flex items-start gap-2">
        <kind.Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-tight">{action.title}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {action.summary}
          </p>
        </div>
        <span
          className={cn(
            'flex shrink-0 items-center gap-1 text-[11px] font-medium',
            status.className
          )}
        >
          <status.Icon className="h-3.5 w-3.5" />
          {status.label}
        </span>
      </div>

      {action.details?.length > 0 && (
        <dl className="mt-3 space-y-1 border-t border-border pt-2 text-xs">
          {action.details.map((d, i) => (
            <div key={`${d.label}-${i}`} className="flex gap-3">
              <dt className="w-28 shrink-0 text-muted-foreground">{d.label}</dt>
              <dd className="min-w-0 flex-1 break-words font-medium">
                {d.value}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {action.status === 'executed' && action.result_text && (
        <p className="mt-3 rounded-lg bg-emerald-50 px-2.5 py-2 text-xs text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
          {action.result_text}
        </p>
      )}
      {action.status === 'failed' && action.error && (
        <p className="mt-3 rounded-lg bg-red-50 px-2.5 py-2 text-xs text-red-800 dark:bg-red-950/40 dark:text-red-200">
          {action.error}
        </p>
      )}

      {open && (
        <div className="mt-3 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isBusy}
            onClick={() => decide('cancel')}
          >
            {busy === 'cancel' ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : null}
            Dismiss
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={isBusy}
            onClick={() => decide('confirm')}
          >
            {busy === 'confirm' ? (
              <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
            ) : null}
            Confirm
          </Button>
        </div>
      )}
    </div>
  );
};

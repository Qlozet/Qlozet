'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { RotateCcw, Coins, HandCoins, Loader2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  useResolveDisputeMutation,
  type Dispute,
  type DisputeResolution,
} from '@/redux/services/disputes/disputes.api-slice';
import {
  REASON_LABELS,
  STATUS_META,
  customerName,
  vendorName,
  formatDate,
  isActionable,
} from '../lib/dispute-labels';
import { OrderConversationView } from './order-conversation-view';

interface ResolveDisputeModalProps {
  dispute: Dispute | null;
  onClose: () => void;
}

const OPTIONS: {
  value: DisputeResolution;
  title: string;
  desc: string;
  icon: typeof RotateCcw;
}[] = [
  {
    value: 'full_refund',
    title: 'Full refund',
    desc: "Refund the customer in full and reverse the vendor's earnings.",
    icon: RotateCcw,
  },
  {
    value: 'partial_refund',
    title: 'Partial refund',
    desc: 'Refund a set amount; the vendor keeps the remainder.',
    icon: Coins,
  },
  {
    value: 'release_to_vendor',
    title: 'Release to vendor',
    desc: 'Dismiss the dispute and release the held payout to the vendor.',
    icon: HandCoins,
  },
];

export function ResolveDisputeModal({
  dispute,
  onClose,
}: ResolveDisputeModalProps) {
  const [resolution, setResolution] = useState<DisputeResolution | ''>('');
  const [refundAmount, setRefundAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [resolveDispute, { isLoading }] = useResolveDisputeMutation();

  useEffect(() => {
    if (dispute) {
      setResolution('');
      setRefundAmount('');
      setNotes('');
    }
  }, [dispute]);

  if (!dispute) return null;

  const actionable = isActionable(dispute.status);
  const meta = STATUS_META[dispute.status];

  const submit = async () => {
    if (!resolution) {
      toast.error('Choose how to resolve the dispute.');
      return;
    }
    let amount: number | undefined;
    if (resolution === 'partial_refund') {
      amount = Number(refundAmount);
      if (!amount || amount < 1) {
        toast.error('Enter the refund amount for a partial refund.');
        return;
      }
    }
    try {
      await resolveDispute({
        id: dispute._id,
        resolution,
        refund_amount: amount,
        admin_notes: notes.trim() || undefined,
      }).unwrap();
      toast.success('Dispute resolved');
      onClose();
    } catch (err) {
      const msg = (err as { data?: { message?: string | string[] } })?.data
        ?.message;
      toast.error(
        (Array.isArray(msg) ? msg[0] : msg) || 'Could not resolve the dispute.'
      );
    }
  };

  return (
    <Sheet open={!!dispute} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <SheetTitle>Dispute · {dispute.order_reference}</SheetTitle>
            {meta && <Badge variant={meta.variant}>{meta.label}</Badge>}
          </div>
          <SheetDescription>
            {customerName(dispute.customer)} vs {vendorName(dispute.business)} ·
            filed {formatDate(dispute.createdAt)}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 flex flex-col gap-6">
          {/* Case summary */}
          <section className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Reason
              </span>
              <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                {REASON_LABELS[dispute.reason] ?? dispute.reason}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {dispute.description}
            </p>
            {dispute.evidence_urls?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {dispute.evidence_urls.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noreferrer">
                    <img
                      src={url}
                      alt={`evidence ${i + 1}`}
                      className="h-16 w-16 rounded-md object-cover"
                    />
                  </a>
                ))}
              </div>
            )}
          </section>

          {/* Vendor response */}
          {dispute.vendor_response && (
            <section className="flex flex-col gap-2 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Vendor response
              </span>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {dispute.vendor_response}
              </p>
              {dispute.vendor_evidence_urls &&
                dispute.vendor_evidence_urls.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {dispute.vendor_evidence_urls.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noreferrer">
                        <img
                          src={url}
                          alt={`vendor evidence ${i + 1}`}
                          className="h-16 w-16 rounded-md object-cover"
                        />
                      </a>
                    ))}
                  </div>
                )}
            </section>
          )}

          {/* Read-only bespoke chat — evidence for the decision. */}
          <section className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Conversation
            </span>
            <OrderConversationView reference={dispute.order_reference} />
          </section>

          {actionable ? (
            <>
              {/* Resolution choice */}
              <section className="flex flex-col gap-3">
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  Resolution
                </span>
                {OPTIONS.map((opt) => {
                  const active = resolution === opt.value;
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setResolution(opt.value)}
                      className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-colors ${
                        active
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300 dark:border-gray-800'
                      }`}
                    >
                      <Icon
                        className={`mt-0.5 size-5 flex-shrink-0 ${
                          active ? 'text-primary' : 'text-gray-400'
                        }`}
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                          {opt.title}
                        </span>
                        <span className="text-xs text-gray-500">
                          {opt.desc}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </section>

              {resolution === 'partial_refund' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Refund amount (₦)
                  </label>
                  <Input
                    type="number"
                    min={1}
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    placeholder="e.g. 15000"
                  />
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Admin notes (optional)
                </label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Explain the decision for the record…"
                  rows={3}
                />
              </div>

              <button
                type="button"
                onClick={submit}
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {isLoading && <Loader2 className="size-4 animate-spin" />}
                {isLoading ? 'Resolving…' : 'Resolve dispute'}
              </button>
            </>
          ) : (
            <section className="flex flex-col gap-2 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Outcome
              </span>
              <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                {meta?.label ?? dispute.status}
                {typeof dispute.refund_amount === 'number' &&
                  dispute.refund_amount > 0 &&
                  ` · ₦${dispute.refund_amount.toLocaleString()}`}
              </span>
              {dispute.admin_notes && (
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {dispute.admin_notes}
                </p>
              )}
            </section>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

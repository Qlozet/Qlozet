'use client';

import { useState } from 'react';
import { create, useModal } from '@ebay/nice-modal-react';
import { Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { readApiError } from '@/redux/services/types';
import { useDecideVendorVerificationMutation } from '@/redux/services/businesses/businesses.api-slice';
import {
  NESTED_MODAL_LAYER,
  useNestedModalDismiss,
} from '@/lib/hooks/useNestedModalDismiss';

export type VerificationDecision = 'approved' | 'action_required' | 'rejected';

interface VerificationDecisionModalProps {
  businessId: string;
  vendorName?: string;
  decision: VerificationDecision;
}

const COPY: Record<
  VerificationDecision,
  {
    title: string;
    blurb: string;
    label: string;
    placeholder: string;
    confirm: string;
    destructive?: boolean;
  }
> = {
  approved: {
    title: 'Approve this vendor',
    blurb:
      'Their products become visible in the shop and they can start taking orders.',
    label: 'Note (optional, internal)',
    placeholder: 'Anything worth recording about this decision',
    confirm: 'Approve vendor',
  },
  action_required: {
    title: 'Ask the vendor to fix something',
    blurb:
      'They stay unable to sell, keep everything they have built, and get one more verification attempt.',
    label: 'What do they need to fix?',
    placeholder:
      'e.g. The name on your payout account does not match the name on your ID.',
    confirm: 'Send back to vendor',
  },
  rejected: {
    title: 'Reject this vendor',
    blurb:
      'They will not be able to sell, and will need support to reopen their verification.',
    label: 'Why are they being rejected?',
    placeholder: 'e.g. The CAC registration belongs to a different company.',
    confirm: 'Reject vendor',
    destructive: true,
  },
};

/**
 * The verification decision.
 *
 * A modal rather than a plain button because two of the three outcomes need a
 * written reason, and that reason is the only thing the vendor is ever shown.
 * The placeholder is a worked example on purpose: "action required" with no
 * action named is a rejection with extra steps, and the quickest way to get a
 * usable sentence is to show one.
 */
export const VerificationDecisionModal = create<VerificationDecisionModalProps>(
  ({ businessId, vendorName, decision }) => {
    const modal = useModal();
    const close = () => modal.remove();
    useNestedModalDismiss(close, modal.visible);

    const [message, setMessage] = useState('');
    const [decide, { isLoading }] = useDecideVendorVerificationMutation();

    if (!modal.visible) return null;

    const copy = COPY[decision];
    const needsMessage = decision !== 'approved';
    const canSubmit =
      (!needsMessage || message.trim().length > 0) && !isLoading;

    const submit = async () => {
      if (!canSubmit) return;
      try {
        await decide({
          businessId,
          decision,
          message: message.trim() || undefined,
        }).unwrap();
        toast.success(
          decision === 'approved'
            ? `${vendorName ?? 'Vendor'} approved`
            : decision === 'action_required'
              ? 'Sent back to the vendor'
              : `${vendorName ?? 'Vendor'} rejected`
        );
        close();
      } catch (error) {
        toast.error(readApiError(error));
      }
    };

    return (
      <div
        className={`fixed inset-0 z-[110] flex items-center justify-center p-4 ${NESTED_MODAL_LAYER}`}
      >
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={close}
        />

        <div
          role="dialog"
          aria-modal="true"
          aria-label={copy.title}
          className="relative z-10 flex w-full max-w-[520px] flex-col overflow-hidden rounded-2xl bg-card shadow-2xl"
        >
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-5 py-4">
            <h2 className="text-base font-semibold text-foreground">
              {copy.title}
            </h2>
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-accent"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="space-y-4 px-5 py-5">
            <p className="text-xs text-muted-foreground">{copy.blurb}</p>

            <div className="space-y-1.5">
              <label
                htmlFor="verification-decision-message"
                className="text-sm font-medium text-foreground"
              >
                {copy.label}
              </label>
              <Textarea
                id="verification-decision-message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder={copy.placeholder}
                rows={4}
              />
              {needsMessage && (
                <p className="text-xs text-muted-foreground">
                  The vendor sees this exact text, and nothing else. Write it to
                  them.
                </p>
              )}
            </div>
          </div>

          <div className="flex shrink-0 justify-end gap-2 border-t border-border px-5 py-4">
            <Button variant="outline" onClick={close} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              onClick={submit}
              disabled={!canSubmit}
              variant={copy.destructive ? 'destructive' : 'default'}
            >
              {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
              {copy.confirm}
            </Button>
          </div>
        </div>
      </div>
    );
  }
);

'use client';

// Escalate something to support.
//
// Raises a support TICKET rather than inventing a parallel record: tickets
// already carry a business, a status and an assignee, and the console already
// has a queue and a detail screen for them. An "escalation" in its own
// collection would need all of that built again.
//
// A vendor and one of their products escalate the same way — same two fields,
// same ticket — so only the copy and the endpoint differ.

import { useState } from 'react';
import { useModal } from '@ebay/nice-modal-react';
import { useRouter } from 'next/navigation';
import { Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { APP_ROUTES } from '@/lib/routes';
import { readApiError } from '@/redux/services/types';
import {
  NESTED_MODAL_LAYER,
  useNestedModalDismiss,
} from '@/lib/hooks/useNestedModalDismiss';

export interface EscalateModalViewProps {
  /** One line saying what the ticket will be raised against. */
  subjectLine: string;
  isLoading: boolean;
  /** Resolves with the created ticket so the admin can be taken to it. */
  onSubmit: (values: {
    issue_type: string;
    description: string;
  }) => Promise<{ data?: { _id?: string } } | undefined>;
}

export const EscalateModalView = ({
  subjectLine,
  isLoading,
  onSubmit,
}: EscalateModalViewProps) => {
  const modal = useModal();
  const router = useRouter();
  const close = () => modal.remove();
  useNestedModalDismiss(close, modal.visible);

  const [issueType, setIssueType] = useState('');
  const [description, setDescription] = useState('');

  if (!modal.visible) return null;

  const canSubmit = issueType.trim() && description.trim() && !isLoading;

  const submit = async () => {
    if (!canSubmit) return;
    try {
      const created = await onSubmit({
        issue_type: issueType.trim(),
        description: description.trim(),
      });

      toast.success('Escalated to support');
      close();

      // Take the admin to the ticket they just raised — the point of
      // escalating is that someone now works it.
      const ticketId = created?.data?._id;
      if (ticketId) router.push(`${APP_ROUTES.support}/${ticketId}`);
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
        aria-label="Escalate to support"
        className="relative z-10 flex w-full max-w-[520px] flex-col overflow-hidden rounded-2xl bg-card shadow-2xl"
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold text-foreground">
            Escalate to support
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
          <p className="text-xs text-muted-foreground">{subjectLine}</p>

          <div className="space-y-1.5">
            <label
              htmlFor="escalate-issue"
              className="text-sm font-medium text-foreground"
            >
              Issue type
            </label>
            <Input
              id="escalate-issue"
              value={issueType}
              onChange={(event) => setIssueType(event.target.value)}
              placeholder="e.g. Repeated late fulfilment"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="escalate-description"
              className="text-sm font-medium text-foreground"
            >
              What happened
            </label>
            <Textarea
              id="escalate-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
              placeholder="Give whoever picks this up enough to act on."
              className="resize-none"
            />
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border px-5 py-4">
          <Button type="button" variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!canSubmit}
            onClick={() => void submit()}
            className="gap-1.5"
          >
            {isLoading && <Loader2 className="size-3.5 animate-spin" />}
            Escalate
          </Button>
        </div>
      </div>
    </div>
  );
};

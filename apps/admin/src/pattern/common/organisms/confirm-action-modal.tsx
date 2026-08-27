'use client';

import { useState } from 'react';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { QuestionMarkIcon } from '@/pattern/common/atoms/question-mark-icon';

export interface ConfirmActionModalProps {
  /** The question itself, e.g. "Are you sure you want to delete this product?" */
  title: string;
  /** What will actually happen. Say the consequence, not "this cannot be undone". */
  description?: string;
  /** Label on the action button, e.g. "Delete Product". */
  confirmLabel?: string;
  /** Renders the action button in the destructive colour. */
  destructive?: boolean;
  /** Ask for a free-text reason; `required` blocks confirming without one. */
  reason?: { label: string; placeholder?: string; required?: boolean };
  /**
   * Runs on confirm. The dialog stays open (with a busy button) until it
   * settles, so a slow request can't be double-submitted, and stays open on
   * failure so the caller's error toast has something to sit behind.
   */
  onConfirm: (reason?: string) => Promise<unknown> | unknown;
}

/**
 * One confirmation dialog for every irreversible action.
 *
 * Deleting a product, rejecting a listing and deactivating a live item all need
 * the same "state the consequence, then confirm" step; rejection additionally
 * needs a reason, which the vendor is shown, so the reason field lives here
 * rather than in a second near-identical modal.
 *
 * The layout matches the vendor app's DeleteProductConfirmationModal — question
 * disc, centred question, one full-width action button, and the close control
 * as the only way to back out — so the same action reads the same in both
 * consoles.
 */
export const ConfirmActionModal = NiceModal.create<ConfirmActionModalProps>(
  ({
    title,
    description,
    confirmLabel = 'Confirm',
    destructive = false,
    reason,
    onConfirm,
  }) => {
    const modal = useModal();
    const [text, setText] = useState('');
    const [busy, setBusy] = useState(false);

    if (!modal.visible) return null;

    const close = () => {
      if (!busy) modal.remove();
    };

    const blocked = Boolean(reason?.required && !text.trim());

    const confirm = async () => {
      if (blocked || busy) return;
      setBusy(true);
      try {
        await onConfirm(text.trim() || undefined);
        modal.remove();
      } catch {
        // The caller surfaces the error; keep the dialog open so the admin can
        // retry or cancel rather than losing what they typed.
        setBusy(false);
      }
    };

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={close}
        />

        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-action-title"
          className="relative z-10 flex w-full max-w-[420px] flex-col items-center rounded-[12px] bg-card px-8 py-10 shadow-2xl"
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute right-5 top-5 flex size-8 items-center justify-center rounded-md border border-border text-foreground transition-colors hover:bg-accent"
          >
            <X className="size-4" />
          </button>

          <QuestionMarkIcon size={108} />

          <h2
            id="confirm-action-title"
            className="mt-8 text-center text-lg font-bold text-foreground"
          >
            {title}
          </h2>

          {description && (
            <p className="mt-3.5 text-center text-xs leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}

          {reason && (
            <div className="mt-5 w-full space-y-1.5 text-left">
              <label
                htmlFor="confirm-action-reason"
                className="text-sm font-medium text-foreground"
              >
                {reason.label}
                {reason.required && (
                  <span className="text-destructive"> *</span>
                )}
              </label>
              <Textarea
                id="confirm-action-reason"
                rows={3}
                maxLength={500}
                value={text}
                placeholder={reason.placeholder}
                onChange={(event) => setText(event.target.value)}
                className="resize-none"
              />
            </div>
          )}

          <Button
            type="button"
            size="lg"
            variant={destructive ? 'destructive' : 'default'}
            onClick={() => void confirm()}
            disabled={blocked || busy}
            className="mt-6 w-full gap-2"
          >
            {busy && <Loader2 className="size-4 animate-spin" />}
            {busy ? 'Working…' : confirmLabel}
          </Button>
        </div>
      </div>
    );
  }
);

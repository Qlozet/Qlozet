'use client';

import { useState } from 'react';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export interface ConfirmActionModalProps {
  title: string;
  /** Body copy. Say what will happen, not just "are you sure?". */
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Renders the confirm button in the destructive colour. */
  destructive?: boolean;
  /** Ask for a free-text reason; `required` blocks confirming without one. */
  reason?: { label: string; placeholder?: string; required?: boolean };
  /**
   * Runs on confirm. The modal stays open (with a busy button) until it
   * settles, so a slow request can't be double-submitted, and stays open on
   * failure so the caller's error toast has something to sit behind.
   */
  onConfirm: (reason?: string) => Promise<unknown> | unknown;
}

/**
 * One confirmation dialog for every irreversible row action.
 *
 * Deleting a product, rejecting a listing and deactivating a live item all need
 * the same "state the consequence, then confirm" step; rejection additionally
 * needs a reason, which the vendor is shown, so the reason field lives here
 * rather than in a second near-identical modal.
 */
export const ConfirmActionModal = NiceModal.create<ConfirmActionModalProps>(
  ({
    title,
    description,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
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
          className="relative z-10 w-full max-w-sm rounded-2xl bg-card p-6 shadow-2xl"
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-muted/80"
          >
            <X className="size-4" />
          </button>

          <h2
            id="confirm-action-title"
            className="pr-8 text-lg font-semibold text-foreground"
          >
            {title}
          </h2>

          {description && (
            <p className="mt-2 text-sm text-grey3 dark:text-gray-400">
              {description}
            </p>
          )}

          {reason && (
            <div className="mt-4 space-y-1.5">
              <label
                htmlFor="confirm-action-reason"
                className="text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                {reason.label}
                {reason.required && <span className="text-error"> *</span>}
              </label>
              <Textarea
                id="confirm-action-reason"
                rows={3}
                maxLength={500}
                value={text}
                placeholder={reason.placeholder}
                onChange={(event) => setText(event.target.value)}
              />
            </div>
          )}

          <div className="mt-6 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={close}
              disabled={busy}
            >
              {cancelLabel}
            </Button>
            <Button
              type="button"
              onClick={confirm}
              disabled={blocked || busy}
              className={cn(
                destructive &&
                  'bg-destructive text-destructive-foreground hover:bg-destructive/90'
              )}
            >
              {busy ? 'Working…' : confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    );
  }
);

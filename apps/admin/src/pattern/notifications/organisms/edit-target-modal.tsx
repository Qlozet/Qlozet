'use client';

import { useState } from 'react';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  TARGET_OPTIONS,
  type NotificationTarget,
} from '../data/notification-catalog';

interface EditTargetModalProps {
  title: string;
  current: NotificationTarget;
}

// Edit which audience a notification targets. Resolves the chosen target so the
// caller can persist it: `const target = await NiceModal.show(EditTargetModal, ...)`.
export const EditTargetModal = NiceModal.create(
  ({ title, current }: EditTargetModalProps) => {
    const modal = useModal();
    const [target, setTarget] = useState<NotificationTarget>(current);

    if (!modal.visible) return null;

    // Resolve so the awaiting caller continues (and hits its no-op guard).
    const handleClose = () => {
      modal.resolve(undefined);
      modal.remove();
    };

    const handleSave = () => {
      modal.resolve(target);
      modal.remove();
    };

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={handleClose}
        />

        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-target-title"
          className="relative z-10 w-full max-w-md rounded-2xl bg-card p-6 shadow-2xl"
        >
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition"
          >
            <X className="size-4" />
          </button>

          <h2
            id="edit-target-title"
            className="text-lg font-semibold text-foreground"
          >
            Edit Target
          </h2>
          <p className="mt-1 text-sm text-grey3">
            Choose who receives the <span className="font-medium">{title}</span>{' '}
            notification.
          </p>

          <div className="mt-6 space-y-2">
            {TARGET_OPTIONS.map((option) => {
              const active = option.value === target;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setTarget(option.value)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm transition-colors cursor-pointer',
                    active
                      ? 'border-primary bg-primary/5 text-grey-black'
                      : 'border-border text-grey3 hover:bg-gray-50'
                  )}
                >
                  <span>{option.label}</span>
                  {active && <Check className="size-4 text-primary" />}
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSave}>
              Save changes
            </Button>
          </div>
        </div>
      </div>
    );
  }
);

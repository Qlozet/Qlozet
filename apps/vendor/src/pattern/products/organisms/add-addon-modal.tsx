'use client';

import { useState } from 'react';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Palette, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export interface AddonDefinition {
  name: string;
  displayType: 'colour' | 'picture';
}

// Modal for creating a new add-on category (e.g. "Buttons", "Thread", "Lining")
// Resolves with { name, displayType } or null if cancelled.
export const AddAddonModal = NiceModal.create(() => {
  const modal = useModal();

  const [name, setName] = useState('');
  const [displayType, setDisplayType] = useState<'colour' | 'picture'>('colour');

  if (!modal.visible) return null;

  const cancel = () => {
    modal.resolve(null);
    modal.remove();
  };

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error('Please enter a name for the add-on');
      return;
    }
    modal.resolve({ name: trimmed, displayType } as AddonDefinition);
    modal.remove();
  };

  return (
    <Dialog open={modal.visible} onOpenChange={(open) => !open && cancel()}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden sm:rounded-[16px] bg-card border-none sm:border-solid">
        <div className="flex flex-col sm:rounded-[16px]">
          {/* Header */}
          <div className="border-b border-border p-6">
            <DialogTitle className="text-base font-semibold text-grey-black dark:text-white m-0">
              Create Add-On
            </DialogTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Define a new add-on category for your product
            </p>
          </div>

          {/* Body */}
          <div className="space-y-5 p-6">
            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Add-On Name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Buttons, Thread, Lining..."
                className="bg-background"
                autoFocus
              />
            </div>

            {/* Display Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Display Type
              </label>
              <p className="text-xs text-muted-foreground">
                How should each variant be displayed to the customer?
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDisplayType('colour')}
                  className={cn(
                    'flex flex-col items-center gap-2.5 rounded-lg border-2 p-4 transition-all',
                    displayType === 'colour'
                      ? 'border-primary bg-primary/5'
                      : 'border-input hover:border-primary/30'
                  )}
                >
                  <div
                    className={cn(
                      'flex size-10 items-center justify-center rounded-full',
                      displayType === 'colour'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-accent text-muted-foreground'
                    )}
                  >
                    <Palette className="size-5" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">Colour</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      Pick a colour swatch for each variant
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setDisplayType('picture')}
                  className={cn(
                    'flex flex-col items-center gap-2.5 rounded-lg border-2 p-4 transition-all',
                    displayType === 'picture'
                      ? 'border-primary bg-primary/5'
                      : 'border-input hover:border-primary/30'
                  )}
                >
                  <div
                    className={cn(
                      'flex size-10 items-center justify-center rounded-full',
                      displayType === 'picture'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-accent text-muted-foreground'
                    )}
                  >
                    <ImageIcon className="size-5" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">Picture</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      Upload an image for each variant
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
            <button
              type="button"
              onClick={cancel}
              className="rounded-lg border border-input px-4 py-2.5 text-sm font-medium text-foreground hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={!name.trim()}
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Create Add-On
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ProfileSaveBarProps {
  dirty: boolean;
  saving: boolean;
  onDiscard: () => void;
  /** The form's own submit runs on the Save button (type=submit). */
  className?: string;
}

/**
 * Appears only while the form has unsaved edits, pinned to the bottom of the
 * viewport, so Save is never off-screen on a long form and never offered
 * when there is nothing to save.
 */
export const ProfileSaveBar = ({
  dirty,
  saving,
  onDiscard,
  className,
}: ProfileSaveBarProps) => {
  if (!dirty) return null;
  return (
    <div
      className={cn(
        'sticky bottom-3 z-20 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card/95 px-4 py-3 shadow-lg backdrop-blur',
        className
      )}
      role="status"
    >
      <span className="text-sm text-muted-foreground">Unsaved changes</span>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onDiscard}
          disabled={saving}
          className="h-10"
        >
          Discard
        </Button>
        <Button type="submit" disabled={saving} className="h-10 px-6">
          {saving ? 'Saving…' : 'Save changes'}
        </Button>
      </div>
    </div>
  );
};

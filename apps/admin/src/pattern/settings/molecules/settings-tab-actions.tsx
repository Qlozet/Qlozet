'use client';

// Settings Tab Actions - Molecule
// Each tab commits on its own, so each one ends in its own save row. Scoping
// the save to the tab keeps the button honest: it sends what is on screen, and
// never quietly writes an edit the reader has scrolled away from.

import React from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SettingsTabActionsProps {
  tabLabel: string;
  changeCount: number;
  errorCount: number;
  isSaving?: boolean;
  /** Something else is in flight (a token price refresh), so hold the buttons. */
  isBusy?: boolean;
  onSave: () => void;
  onDiscard: () => void;
}

export const SettingsTabActions = ({
  tabLabel,
  changeCount,
  errorCount,
  isSaving,
  isBusy,
  onSave,
  onDiscard,
}: SettingsTabActionsProps) => {
  const hasChanges = changeCount > 0;
  const blocked = errorCount > 0;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-white dark:bg-card p-4 max-sm:items-stretch sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm" aria-live="polite">
        {blocked ? (
          <span className="font-medium text-error">
            {errorCount} field{errorCount === 1 ? '' : 's'} on this tab need
            {errorCount === 1 ? 's' : ''} fixing before you can save.
          </span>
        ) : hasChanges ? (
          <span className="text-grey-black dark:text-white">
            <span className="font-semibold">{changeCount}</span> unsaved change
            {changeCount === 1 ? '' : 's'} in {tabLabel}.
          </span>
        ) : (
          <span className="text-grey3 dark:text-gray-400">
            Everything on this tab is saved.
          </span>
        )}
      </p>

      <div className="flex items-center gap-2 max-sm:justify-end">
        <Button
          variant="outline"
          size="sm"
          disabled={!hasChanges || isSaving || isBusy}
          onClick={onDiscard}
        >
          <RotateCcw />
          Discard
        </Button>
        <Button
          size="sm"
          disabled={!hasChanges || blocked || isSaving || isBusy}
          onClick={onSave}
        >
          {isSaving ? 'Saving…' : 'Save changes'}
        </Button>
      </div>
    </div>
  );
};

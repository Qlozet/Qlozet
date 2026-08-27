'use client';

// Settings Content - Organism
// The active tab's sections. Everything is rendered from the catalogue except
// the token price, which is a derived pair and gets its own card at the top of
// the AI tab.

import React from 'react';
import {
  AI_TOKENS_TAB_SLUG,
  TOKEN_PRICE_USD_KEY,
  fieldKeysForTab,
  type SettingsTab,
} from '../lib/settings-tabs';
import type {
  DraftValue,
  SettingsDraft,
  SettingsErrors,
} from '../lib/settings-form';
import { SettingsSection } from '../molecules/settings-section';
import { SettingsTabActions } from '../molecules/settings-tab-actions';
import { TokenPriceCard } from './token-price-card';
import type { TokenPrice } from '@/redux/services/settings/settings.api-slice';

interface SettingsContentProps {
  tab: SettingsTab;
  draft: SettingsDraft;
  errors: SettingsErrors;
  /** Unsaved changes on this tab — what its Save button will send. */
  changeCount: number;
  /** Unsaved changes anywhere, which is what a token price refresh would lose. */
  totalChangeCount: number;
  tokenPrice?: TokenPrice;
  isSaving?: boolean;
  isRefreshing?: boolean;
  onChange: (key: string, value: DraftValue) => void;
  onSave: () => void;
  onDiscard: () => void;
  onRefreshTokenPrice: () => void;
}

export const SettingsContent = ({
  tab,
  draft,
  errors,
  changeCount,
  totalChangeCount,
  tokenPrice,
  isSaving,
  isRefreshing,
  onChange,
  onSave,
  onDiscard,
  onRefreshTokenPrice,
}: SettingsContentProps) => {
  // Read through the same helper the save uses, so the count of what is
  // blocking Save can never drift from the set of fields Save would send.
  const tabErrorCount = fieldKeysForTab(tab).filter(
    (key) => errors[key]
  ).length;

  // A refresh rewrites the settings document, and the refetch that follows
  // re-reads the whole form from the server. Anything typed between the click
  // and that refetch would be reverted with nothing to show for it, so the
  // fields are held shut for the round trip — the button's own `isDirty` guard
  // only covers edits that already existed when it was clicked.
  const isLocked = Boolean(isSaving || isRefreshing);

  return (
    <div className="space-y-5">
      <p className="text-sm text-grey3 dark:text-gray-400">{tab.description}</p>

      {tab.slug === AI_TOKENS_TAB_SLUG && (
        <TokenPriceCard
          value={draft[TOKEN_PRICE_USD_KEY] ?? ''}
          error={errors[TOKEN_PRICE_USD_KEY]}
          tokenPrice={tokenPrice}
          disabled={isLocked}
          isRefreshing={isRefreshing}
          isDirty={totalChangeCount > 0}
          onChange={(value) => onChange(TOKEN_PRICE_USD_KEY, value)}
          onRefresh={onRefreshTokenPrice}
        />
      )}

      {tab.sections.map((section) => (
        <SettingsSection
          key={section.id}
          section={section}
          draft={draft}
          errors={errors}
          disabled={isLocked}
          onChange={onChange}
        />
      ))}

      <SettingsTabActions
        tabLabel={tab.label}
        changeCount={changeCount}
        errorCount={tabErrorCount}
        isSaving={isSaving}
        isBusy={isLocked}
        onSave={onSave}
        onDiscard={onDiscard}
      />
    </div>
  );
};

'use client';

// Settings Content - Organism
// The active tab's sections. Everything is rendered from the catalogue except
// the token packs, which are a list with their own Save and sit at the top of
// the AI tab. (Purchases are priced from the packs now, not a per-token price,
// so the old token-price card is no longer shown.)

import React from 'react';
import {
  AI_TOKENS_TAB_SLUG,
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
import { TokenPacksCard } from './token-packs-card';
import { ListingReviewNotice } from '../molecules/listing-review-notice';
import { VendorVerificationNotice } from '../molecules/vendor-verification-notice';
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
  isSaving,
  isRefreshing,
  onChange,
  onSave,
  onDiscard,
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

      {tab.slug === AI_TOKENS_TAB_SLUG && <TokenPacksCard />}

      {tab.sections.some((s) => s.id === 'listing-review') && (
        <ListingReviewNotice
          mode={String(draft.listing_review_mode ?? 'review_first')}
        />
      )}

      {tab.sections.some((s) => s.id === 'vendor-verification') && (
        <VendorVerificationNotice
          mode={String(draft.vendor_verification_mode ?? 'qoreid')}
        />
      )}

      {/* Cards grid — mirrors the vendor console's order settings layout.
          items-start keeps a short card from stretching to its neighbour's
          height, which would strand its rows above dead space. */}
      <div className="grid grid-cols-1 items-start gap-5 md:grid-cols-2">
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
      </div>

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

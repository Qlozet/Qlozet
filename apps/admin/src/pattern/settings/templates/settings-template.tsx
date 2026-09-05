'use client';

// Settings Template
// The platform settings screen: section tabs over one document. Each tab ends
// in its own save row and commits only its own fields, so the nav carries a
// marker for any tab left mid-edit.

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SettingsTab } from '../lib/settings-tabs';
import type {
  DraftValue,
  SettingsDraft,
  SettingsErrors,
} from '../lib/settings-form';
import { SettingsNavigation } from '../molecules/settings-navigation';
import { SettingsContent } from '../organisms/settings-content';
import { SettingsSkeleton } from '../organisms/settings-skeleton';
import type { TokenPrice } from '@/redux/services/settings/settings.api-slice';

interface SettingsTemplateProps {
  activeTab: SettingsTab;
  draft: SettingsDraft;
  errors: SettingsErrors;
  /** Unsaved change count per tab slug. */
  changesByTab: Record<string, number>;
  tokenPrice?: TokenPrice;
  isLoading?: boolean;
  isError?: boolean;
  isSaving?: boolean;
  isRefreshing?: boolean;
  onSelectTab: (label: string) => void;
  onChange: (key: string, value: DraftValue) => void;
  onSave: () => void;
  onDiscard: () => void;
  onRefreshTokenPrice: () => void;
  onRetry: () => void;
}

export const SettingsTemplate = ({
  activeTab,
  draft,
  errors,
  changesByTab,
  tokenPrice,
  isLoading,
  isError,
  isSaving,
  isRefreshing,
  onSelectTab,
  onChange,
  onSave,
  onDiscard,
  onRefreshTokenPrice,
  onRetry,
}: SettingsTemplateProps) => {
  const totalChangeCount = Object.values(changesByTab).reduce(
    (sum, count) => sum + count,
    0
  );

  return (
    <div className="w-full min-h-screen h-fit pb-10">
      {/* Width matches the vendor app's settings page (max-w-7xl, centred). */}
      <div className="w-full max-w-7xl mx-auto">
        {/* No page heading here: the dashboard top bar already titles the route,
          and a second "Settings" under it reads as a repeat. */}
        <p className="max-w-[950px] max-md:text-xs md:text-sm text-grey3 dark:text-gray-400">
          Platform-wide rules for payouts, commission, orders and AI billing.
          Changes apply to every vendor and order from the moment they are
          saved.
        </p>

        <SettingsNavigation
          activeTab={activeTab.label}
          changesByTab={changesByTab}
          onSelect={onSelectTab}
          className="mt-5"
        />

        <div className="mt-6">
          {isError ? (
            <div className="rounded-xl bg-white p-8 text-center custom-card-shadow dark:border dark:border-white/10 dark:bg-card">
              <AlertCircle className="mx-auto size-6 text-error" />
              <p className="mt-3 text-sm font-medium text-grey-black dark:text-white">
                We couldn’t load the platform settings.
              </p>
              <p className="mt-1 text-sm text-grey3 dark:text-gray-400">
                Nothing has been changed. Try again in a moment.
              </p>
              <Button variant="outline" className="mt-4" onClick={onRetry}>
                Try again
              </Button>
            </div>
          ) : isLoading ? (
            <SettingsSkeleton />
          ) : (
            <SettingsContent
              tab={activeTab}
              draft={draft}
              errors={errors}
              changeCount={changesByTab[activeTab.slug] ?? 0}
              totalChangeCount={totalChangeCount}
              tokenPrice={tokenPrice}
              isSaving={isSaving}
              isRefreshing={isRefreshing}
              onChange={onChange}
              onSave={onSave}
              onDiscard={onDiscard}
              onRefreshTokenPrice={onRefreshTokenPrice}
            />
          )}
        </div>
      </div>
    </div>
  );
};

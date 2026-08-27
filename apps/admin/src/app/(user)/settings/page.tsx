'use client';

import { Suspense, useCallback, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { SettingsTemplate } from '@/pattern/settings/templates/settings-template';
import {
  SETTINGS_TABS,
  SETTINGS_TAB_PARAM,
  fieldKeysForTab,
  slugForTab,
  tabFromSlug,
} from '@/pattern/settings/lib/settings-tabs';
import {
  buildDraft,
  buildPayload,
  changedKeys,
  validateDraft,
  type DraftValue,
  type SettingsDraft,
} from '@/pattern/settings/lib/settings-form';
import { SettingsSkeleton } from '@/pattern/settings/organisms/settings-skeleton';
import { readApiError } from '@/redux/services/types';
import {
  useGetPlatformSettingsQuery,
  useUpdatePlatformSettingsMutation,
  useRefreshTokenPriceMutation,
  type PlatformSettings,
} from '@/redux/services/settings/settings.api-slice';

// Which revision of the server's document a draft was built from.
const stampOf = (settings: PlatformSettings): string =>
  settings.updatedAt ?? settings._id ?? 'loaded';

// The active section lives in the URL (`/settings?tab=orders`) so it survives
// reloads, can be linked to, and responds to the back button.
//
// The draft spans every tab — all five edit one settings document — but each
// tab saves only its own fields. So a save has to merge rather than re-seed:
// re-seeding wholesale would throw away edits sitting unsaved on another tab.
//
// The saved baseline is held here rather than read off the query cache. PATCH
// answers with the updated document, but the cache only refreshes on the
// invalidation refetch a round trip later — diffing against the cache would
// leave a just-saved tab still claiming unsaved changes, and a Discard clicked
// in that window would revert to the pre-save value.
const SettingsPageContent = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { data, isLoading, isError, refetch } = useGetPlatformSettingsQuery();
  const [updateSettings, { isLoading: isSaving }] =
    useUpdatePlatformSettingsMutation();
  const [refreshTokenPrice, { isLoading: isRefreshing }] =
    useRefreshTokenPriceMutation();

  const serverSettings = data?.data;

  // What the draft is diffed against: the last document known to be saved.
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [draft, setDraft] = useState<SettingsDraft>({});

  // After a tab saves, only that tab's fields go back to the saved values.
  // Everything else keeps whatever is in the draft, so an edit parked on
  // another tab survives. Advancing the baseline here — not on the refetch —
  // is what makes the tab read as saved the moment the PATCH answers.
  const commitSaved = useCallback(
    (next: PlatformSettings, savedKeys: readonly string[]) => {
      setSettings(next);
      const fresh = buildDraft(next);
      setDraft((prev) => {
        const merged = { ...prev };
        savedKeys.forEach((key) => {
          merged[key] = fresh[key];
        });
        return merged;
      });
    },
    []
  );

  // Adopting the server's copy resets the whole form, so it only happens when
  // the document's own timestamp shows the server's copy actually moved —
  // re-seeding on every render of the query result would wipe what is being
  // typed each time RTK Query refetched.
  //
  // Adjusted during render rather than in an effect: React re-runs this
  // component immediately and never commits the pass that had the stale draft,
  // so the form cannot paint one frame of the old document.
  if (
    serverSettings &&
    (!settings || stampOf(settings) !== stampOf(serverSettings))
  ) {
    setSettings(serverSettings);
    setDraft(buildDraft(serverSettings));
  }

  const activeTab = tabFromSlug(searchParams.get(SETTINGS_TAB_PARAM));

  const selectTab = useCallback(
    (label: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(SETTINGS_TAB_PARAM, slugForTab(label));
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const tabKeys = useMemo(() => fieldKeysForTab(activeTab), [activeTab]);

  const errors = useMemo(
    () => (settings ? validateDraft(draft, settings) : {}),
    [draft, settings]
  );

  // Counted per tab so each Save button knows what it would send, and so the
  // nav can mark the tabs holding edits the reader has navigated away from.
  const changesByTab = useMemo(() => {
    const counts: Record<string, number> = {};
    SETTINGS_TABS.forEach((tab) => {
      counts[tab.slug] = settings
        ? changedKeys(draft, settings, fieldKeysForTab(tab)).length
        : 0;
    });
    return counts;
  }, [draft, settings]);

  const handleChange = useCallback((key: string, value: DraftValue) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Discard is scoped like Save: it reverts this tab, not the whole form.
  const handleDiscard = useCallback(() => {
    if (!settings) return;
    const fresh = buildDraft(settings);
    setDraft((prev) => {
      const reverted = { ...prev };
      tabKeys.forEach((key) => {
        reverted[key] = fresh[key];
      });
      return reverted;
    });
  }, [settings, tabKeys]);

  const handleSave = useCallback(async () => {
    if (!settings) return;
    const saved = changedKeys(draft, settings, tabKeys);
    const payload = buildPayload(draft, settings, tabKeys);
    if (!Object.keys(payload).length) return;

    try {
      const result = await updateSettings(payload).unwrap();
      // PATCH answers with the updated document, so this tab's fields can be
      // settled from the save itself rather than waiting on the refetch.
      if (result?.data) commitSaved(result.data, saved);
      toast.success(
        `Saved ${saved.length} ${activeTab.label.toLowerCase()} setting${
          saved.length === 1 ? '' : 's'
        }.`
      );
    } catch (error) {
      toast.error(readApiError(error, 'Could not save the settings.'));
    }
  }, [activeTab.label, commitSaved, draft, settings, tabKeys, updateSettings]);

  const handleRefreshTokenPrice = useCallback(async () => {
    try {
      const result = await refreshTokenPrice().unwrap();
      const amount = result?.data?.ngn?.amount;
      toast.success(
        typeof amount === 'number'
          ? `Naira token price refreshed to ₦${amount.toLocaleString()}.`
          : 'Naira token price refreshed.'
      );
    } catch (error) {
      toast.error(readApiError(error, 'Could not refresh the token price.'));
    }
  }, [refreshTokenPrice]);

  return (
    <SettingsTemplate
      activeTab={activeTab}
      draft={draft}
      errors={errors}
      changesByTab={changesByTab}
      tokenPrice={settings?.token_price}
      isLoading={isLoading}
      isError={isError}
      isSaving={isSaving}
      isRefreshing={isRefreshing}
      onSelectTab={selectTab}
      onChange={handleChange}
      onSave={handleSave}
      onDiscard={handleDiscard}
      onRefreshTokenPrice={handleRefreshTokenPrice}
      onRetry={refetch}
    />
  );
};

// useSearchParams needs a Suspense boundary of its own.
const SettingsPage = () => (
  <Suspense
    fallback={
      <div className="w-full pb-10">
        <SettingsSkeleton />
      </div>
    }
  >
    <SettingsPageContent />
  </Suspense>
);

export default SettingsPage;

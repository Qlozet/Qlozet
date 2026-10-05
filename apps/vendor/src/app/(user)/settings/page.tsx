'use client';

import { Suspense, useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { SettingsTemplate } from '@/pattern/settings/templates/settings-template';
import {
  SETTINGS_TAB_PARAM,
  slugForTab,
  tabFromSlug,
  visibleSettingsTabs,
} from '@/pattern/settings/lib/settings-tabs';
import Loader from '@/components/Loader';
import { useAppSelector } from '@/redux/store';
import { selectActiveBusiness } from '@/redux/slices/auth-slice';

// The active section lives in the URL (`/settings?tab=warehouses`) so it
// survives reloads, can be linked to, and responds to the back button.
const SettingsPageContent: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // The roles guard decides ownership from the role's *name*, not from the
  // is_owner flag, and the two can disagree on older records. Accept either, so
  // the nav never hides a tab the server would have let this member open.
  const activeBusiness = useAppSelector(selectActiveBusiness);
  const isOwner = activeBusiness
    ? activeBusiness.is_owner || activeBusiness.role?.toLowerCase() === 'owner'
    : undefined;

  const activeTab = tabFromSlug(
    searchParams.get(SETTINGS_TAB_PARAM),
    isOwner
  ).label;

  const selectTab = useCallback(
    (label: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(SETTINGS_TAB_PARAM, slugForTab(label));
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const settingNav = visibleSettingsTabs(isOwner).map((tab) => ({
    item: tab.label,
    handleFunction: selectTab,
  }));

  return (
    <SettingsTemplate
      navigationItems={settingNav}
      activeTab={activeTab}
      shopDetails={{
        companyName: '',
        addressLine1: '',
        addressLine2: '',
        state: '',
        timeZone: '',
        Phone: '',
        email: '',
        city: '',
        country: '',
        logo: [''],
        cacDocs: [''],
      }}
    />
  );
};

// useSearchParams needs a Suspense boundary of its own.
const SettingsPage: React.FC = () => (
  <Suspense fallback={<Loader />}>
    <SettingsPageContent />
  </Suspense>
);

export default SettingsPage;

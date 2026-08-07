'use client';

import { Suspense, useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { SettingsTemplate } from '@/pattern/settings/templates/settings-template';
import {
  SETTINGS_TABS,
  SETTINGS_TAB_PARAM,
  slugForTab,
  tabFromSlug,
} from '@/pattern/settings/lib/settings-tabs';
import Loader from '@/components/Loader';

// The active section lives in the URL (`/settings?tab=warehouses`) so it
// survives reloads, can be linked to, and responds to the back button.
const SettingsPageContent: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeTab = tabFromSlug(searchParams.get(SETTINGS_TAB_PARAM)).label;

  const selectTab = useCallback(
    (label: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(SETTINGS_TAB_PARAM, slugForTab(label));
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const settingNav = SETTINGS_TABS.map((tab) => ({
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
        nin: '',
        bvn: '',
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

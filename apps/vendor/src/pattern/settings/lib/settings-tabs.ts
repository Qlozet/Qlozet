// Settings tabs, in display order.
//
// `label` is the value the nav and SettingsContent switch on; `slug` is what
// appears in the URL as `?tab=...`, so the active section survives a reload,
// can be linked to directly, and works with the browser's back button.

export interface SettingsTab {
  label: string;
  slug: string;
}

export const SETTINGS_TABS: SettingsTab[] = [
  { label: 'Profile', slug: 'profile' },
  { label: 'Warehouses', slug: 'warehouses' },
  { label: 'Users and permissions', slug: 'users-and-permissions' },
  { label: 'Order Settings', slug: 'order-settings' },
  { label: 'Security', slug: 'security' },
  { label: 'Billing', slug: 'billing' },
];

export const SETTINGS_TAB_PARAM = 'tab';

export const DEFAULT_SETTINGS_TAB = SETTINGS_TABS[0];

// Unknown or missing slugs fall back to the first tab rather than rendering
// an empty page.
export const tabFromSlug = (slug?: string | null): SettingsTab =>
  SETTINGS_TABS.find((tab) => tab.slug === slug?.toLowerCase()) ??
  DEFAULT_SETTINGS_TAB;

export const slugForTab = (label: string): string =>
  SETTINGS_TABS.find((tab) => tab.label === label)?.slug ??
  DEFAULT_SETTINGS_TAB.slug;

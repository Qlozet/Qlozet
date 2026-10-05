// Settings tabs, in display order.
//
// `label` is the value the nav and SettingsContent switch on; `slug` is what
// appears in the URL as `?tab=...`, so the active section survives a reload,
// can be linked to directly, and works with the browser's back button.

export interface SettingsTab {
  label: string;
  slug: string;
  /**
   * Only the business owner may open this tab.
   *
   * Set it where the *read* is owner-gated server-side, not merely the write.
   * A tab a team member can look at but not save is still worth showing - they
   * get a clear refusal on the save. A tab whose own GET returns 403 has
   * nothing to render but an error.
   */
  ownerOnly?: boolean;
}

export const SETTINGS_TABS: SettingsTab[] = [
  { label: 'Profile', slug: 'profile' },
  { label: 'Verification', slug: 'verification', ownerOnly: true },
  { label: 'Warehouses', slug: 'warehouses' },
  {
    label: 'Users and permissions',
    slug: 'users-and-permissions',
    ownerOnly: true,
  },
  { label: 'Order Settings', slug: 'order-settings' },
  { label: 'Payout', slug: 'payout', ownerOnly: true },
  // TODO(api): hidden until the backend supports them. Security had no content
  // beyond a "coming soon" placeholder, and Billing was a form whose inputs
  // were wired to empty handlers — neither reads or writes anything.
  // { label: 'Security', slug: 'security' },
  // { label: 'Billing', slug: 'billing' },
];

export const SETTINGS_TAB_PARAM = 'tab';

export const DEFAULT_SETTINGS_TAB = SETTINGS_TABS[0];

/**
 * The tabs this member may open.
 *
 * `isOwner` is undefined when the role is not known yet - a session stored
 * before the field existed, or persisted state that has been cleared. Show
 * everything in that case. The server enforces access either way, so an
 * unnecessary tab costs a refusal toast, while wrongly hiding this one would
 * take team management away from the actual owner with no route back to it.
 */
export const visibleSettingsTabs = (isOwner?: boolean): SettingsTab[] =>
  SETTINGS_TABS.filter((tab) => !tab.ownerOnly || isOwner !== false);

// Unknown or missing slugs fall back to the first tab rather than rendering
// an empty page. A slug the member may not open is treated as unknown, so
// linking straight to an owner-only tab lands on the first one they can use
// instead of on a page that can only show them an error.
export const tabFromSlug = (
  slug?: string | null,
  isOwner?: boolean
): SettingsTab => {
  const tabs = visibleSettingsTabs(isOwner);
  return (
    tabs.find((tab) => tab.slug === slug?.toLowerCase()) ??
    tabs[0] ??
    DEFAULT_SETTINGS_TAB
  );
};

export const slugForTab = (label: string): string =>
  SETTINGS_TABS.find((tab) => tab.label === label)?.slug ??
  DEFAULT_SETTINGS_TAB.slug;

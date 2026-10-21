// What each team role can do, in one line, for the invite and edit forms.
// Written from the backend's role matrix (common/access/vendor-access.ts,
// VENDOR_AREAS); keep the two in step when a role's rights change.

const ROLE_SUMMARY: Record<string, string> = {
  operations:
    'Runs the shop day to day: orders, returns and disputes, listings and stock, size guides and styles, and the wallet.',
  customer_support: 'Confirms and fulfils orders.',
  sales:
    'Adds and edits listings and stock, manages discounts, and sees your money.',
  marketing: 'Manages discounts and collections.',
  tailor: 'Manages size guides and styles.',
  data_analyst: 'Sees your money and sales figures.',
};

/** "customer_support" -> "Customer Support" */
export const prettyRole = (name?: string): string =>
  (name ?? '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

/**
 * One line on what a role can do. Every member can also update production,
 * see customers, open tickets and use the assistant, so that isn't repeated.
 * A custom role only has those shared rights.
 */
export const roleSummary = (name?: string): string => {
  const key = (name ?? '').trim().toLowerCase();
  if (!key) return '';
  return (
    ROLE_SUMMARY[key] ??
    'Can update production, see customers, open tickets and use the assistant.'
  );
};

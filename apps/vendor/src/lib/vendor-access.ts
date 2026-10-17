// What the signed-in team member may do in this store, read from
// GET /users/me/access (`vendor.areas`). The server enforces the same matrix
// on every route; this only decides what to show, so nobody is offered a
// button that will refuse them.

import type { MyAccess } from '@/redux/services/users/users.api-slice';

/** The areas the backend names in common/access/vendor-access.ts. */
export type VendorArea =
  | 'orders.fulfil'
  | 'orders.reject'
  | 'orders.production'
  | 'returns.manage'
  | 'disputes.respond'
  | 'products.manage'
  | 'products.status'
  | 'products.schedule'
  | 'discounts.manage'
  | 'collections.manage'
  | 'size_guides.manage'
  | 'styles.manage'
  | 'money.view'
  | 'wallet.fund'
  | 'wallet.withdraw'
  | 'payout_account.manage'
  | 'tokens.purchase'
  | 'team.manage'
  | 'store.profile'
  | 'verification'
  | 'tickets'
  | 'customers.view'
  | 'assistant.chat';

/**
 * Whether the member may use this area. Unknown access (still loading, or
 * the read failed, or the account is not on a team) answers yes: hiding the
 * app on a flaky request is worse than showing a control the server will
 * refuse, and the server does refuse it.
 */
export const canUseArea = (
  access: MyAccess | null | undefined,
  area: VendorArea
): boolean => {
  const vendor = access?.vendor;
  if (!vendor) return true;
  if (vendor.is_owner) return true;
  return (vendor.areas ?? []).includes(area);
};

/** `customer_support` → `Customer support`. */
export const formatVendorRole = (access?: MyAccess | null): string | null => {
  const raw = access?.vendor?.role?.replace(/[_-]+/g, ' ').trim();
  if (!raw) return null;
  return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
};

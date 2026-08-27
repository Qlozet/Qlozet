// Display helpers for the admin Customers views.
// The backend response is permissive, so each accessor falls back across the
// handful of field names the API uses for the same concept.

import type { Customer } from '@/redux/services/customers/customers.api-slice';

export type CustomerStatusVariant = 'active' | 'inactive';

export interface CustomerStatusInfo {
  variant: CustomerStatusVariant;
  label: string;
}

// The Customers table only distinguishes Active vs Inactive.
export const getCustomerStatus = (customer: Customer): CustomerStatusInfo => {
  const raw = (customer.status ?? '').toString().toLowerCase();

  if (raw === 'suspended') return { variant: 'inactive', label: 'Suspended' };
  if (['inactive', 'disabled', 'blocked'].includes(raw)) {
    return { variant: 'inactive', label: 'Inactive' };
  }
  return { variant: 'active', label: 'Active' };
};

/**
 * Full display name (e.g. "John Doe"), used in the list and detail header.
 *
 * `full_name` is the field the User schema defines and the endpoint sends.
 * This read `name` and `username` — neither of which the customer records
 * carry — so every row in the table rendered "Unnamed customer".
 */
export const getCustomerName = (customer: Customer): string =>
  customer.full_name ||
  customer.name ||
  [customer.first_name, customer.last_name].filter(Boolean).join(' ') ||
  customer.username ||
  'Unnamed customer';

// The @handle (e.g. "@johndoe"), used in the list and under the detail name.
export const getCustomerHandle = (customer: Customer): string => {
  const handle = customer.username?.trim();
  if (!handle) return '';
  return handle.startsWith('@') ? handle : `@${handle}`;
};

export const getCustomerEmail = (customer: Customer): string =>
  customer.email || '—';

export const getCustomerPhone = (customer: Customer): string =>
  customer.phone || customer.phone_number || '—';

export const getCustomerAvatar = (customer: Customer): string | undefined =>
  customer.avatar || customer.image || customer.profile_picture || undefined;

export const getCustomerInitial = (customer: Customer): string =>
  getCustomerName(customer).replace(/^@/, '').charAt(0).toUpperCase() || 'C';

/**
 * First of `values` that is an actual number.
 *
 * 0 is a real answer and must survive — a customer with no orders has zero,
 * which is not the same as the figure being unknown. `null` is what the
 * endpoint sends when there is no source for a figure at all, and is the only
 * thing that may end up as a dash.
 */
const readNumber = (...values: unknown[]): number | undefined => {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
  }
  return undefined;
};

/**
 * First of `values` that is a non-empty string.
 */
const readString = (...values: unknown[]): string | undefined => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return undefined;
};

/**
 * Orders placed. `total_orders` is what both /admin/customer and
 * /admin/customer/:id send; the camelCase names are kept as a fallback for
 * deployments that predate it.
 */
export const getCustomerTotalOrders = (
  customer: Customer
): number | undefined =>
  readNumber(customer.total_orders, customer.totalOrders, customer.ordersCount);

/**
 * "Ikeja, Lagos". The detail endpoint sends this ready-made in `location` and
 * the structured parts in `address`; the list rows send neither, so this falls
 * back through both rather than dashing a customer whose city we do have.
 */
export const getCustomerLocation = (customer: Customer): string | undefined => {
  const direct = readString(customer.location);
  if (direct) return direct;

  const address = customer.address;
  if (typeof address === 'string') return readString(address);
  if (address && typeof address === 'object') {
    const parts = [
      readString((address as { city?: unknown }).city),
      readString((address as { state?: unknown }).state),
    ].filter(Boolean);
    if (parts.length) return parts.join(', ');
  }

  return readString(customer.city, customer.state);
};

/** When the account was created — `created_at` on the detail endpoint. */
export const getCustomerJoinedDate = (customer: Customer): string | undefined =>
  readString(customer.created_at, customer.createdAt);

/** Last sign-in — `last_login_at` on the detail endpoint. */
export const getCustomerLastLoginAt = (
  customer: Customer
): string | undefined =>
  readString(
    customer.last_login_at,
    customer.lastLoggedIn,
    customer.lastLoginAt
  );

/** Reviews this customer has written. */
export const getCustomerReviewsCount = (
  customer: Customer
): number | undefined =>
  readNumber(customer.reviews_count, customer.reviewsCount);

/** Vendors this customer follows. */
export const getCustomerFollowedVendors = (
  customer: Customer
): number | undefined =>
  readNumber(customer.followed_vendors, customer.followedVendorsCount);

/** Fabrics this customer currently has reserved. */
export const getCustomerReservedFabrics = (
  customer: Customer
): number | undefined =>
  readNumber(customer.reserved_fabrics, customer.reservedFabricCount);

/** Spendable wallet balance, in naira. */
export const getCustomerWalletBalance = (
  customer: Customer
): number | undefined => readNumber(customer.wallet_balance);

/** Balance not yet released to the wallet, in naira. */
export const getCustomerPendingBalance = (
  customer: Customer
): number | undefined => readNumber(customer.pending_balance);

/** Loyalty tokens held. */
export const getCustomerTokenBalance = (
  customer: Customer
): number | undefined => readNumber(customer.token_balance);

/** Value refunded to this customer, in naira. */
export const getCustomerTotalReturns = (
  customer: Customer
): number | undefined => readNumber(customer.total_returns);

/** Everything this customer has ever paid, in naira. */
export const getCustomerLifetimeSpending = (
  customer: Customer
): number | undefined => readNumber(customer.lifetime_spending);

export const getCustomerLastOrderDate = (
  customer: Customer
): string | undefined =>
  readString(
    customer.last_order_at,
    customer.lastOrderDate,
    customer.lastOrderAt
  );

export const formatCount = (value?: number | null): string => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '—';
  return value.toLocaleString();
};

/**
 * Wallet-card amounts use the one canonical formatter, so the console never
 * shows two different naira symbols on the same screen.
 */
export { formatNaira } from './orders';

// DD/MM/YYYY to match the Figma "Last Order date" column.
export const formatDate = (value?: string | null): string => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  const day = `${date.getDate()}`.padStart(2, '0');
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()}`;
};

const ordinal = (day: number): string => {
  const rem100 = day % 100;
  if (rem100 >= 11 && rem100 <= 13) return `${day}th`;
  switch (day % 10) {
    case 1:
      return `${day}st`;
    case 2:
      return `${day}nd`;
    case 3:
      return `${day}rd`;
    default:
      return `${day}th`;
  }
};

// "10th Feb, 2015" to match the Figma "Date joined" card.
export const formatJoinedDate = (value?: string | null): string => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  const month = date.toLocaleString('en-GB', { month: 'short' });
  return `${ordinal(date.getDate())} ${month}, ${date.getFullYear()}`;
};

// "10:45am - 24/02/2025" to match the Figma "Last logged in" card. Falls back to
// the raw value when the backend already sends a preformatted string.
export const formatLastLoggedIn = (customer: Customer): string => {
  const raw = getCustomerLastLoginAt(customer);
  if (!raw) return '—';
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  const time = date
    .toLocaleTimeString('en-GB', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
    .replace(/\s/g, '')
    .toLowerCase();
  return `${time} - ${formatDate(raw)}`;
};

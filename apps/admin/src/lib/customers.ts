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

  if (['inactive', 'disabled', 'suspended', 'blocked'].includes(raw)) {
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
  customer.phone_number || customer.phone || '—';

export const getCustomerAvatar = (customer: Customer): string | undefined =>
  customer.avatar || customer.image || customer.profile_picture || undefined;

export const getCustomerInitial = (customer: Customer): string =>
  getCustomerName(customer).replace(/^@/, '').charAt(0).toUpperCase() || 'C';

/**
 * Orders placed. `total_orders` is joined onto each row by the list endpoint;
 * the camelCase names are kept as a fallback for deployments that predate it.
 *
 * 0 is a real answer and must survive — a customer with no orders has zero,
 * which is not the same as the figure being unknown.
 */
export const getCustomerTotalOrders = (
  customer: Customer
): number | undefined => {
  for (const value of [
    customer.total_orders,
    customer.totalOrders,
    customer.ordersCount,
  ]) {
    if (typeof value === 'number' && !Number.isNaN(value)) return value;
  }
  return undefined;
};

export const getCustomerLastOrderDate = (
  customer: Customer
): string | undefined => {
  const raw =
    customer.last_order_at ?? customer.lastOrderDate ?? customer.lastOrderAt;
  return typeof raw === 'string' && raw.trim() ? raw : undefined;
};

export const formatCount = (value?: number): string => {
  if (typeof value !== 'number' || Number.isNaN(value)) return '—';
  return value.toLocaleString();
};

// DD/MM/YYYY to match the Figma "Last Order date" column.
export const formatDate = (value?: string): string => {
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
export const formatJoinedDate = (value?: string): string => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  const month = date.toLocaleString('en-GB', { month: 'short' });
  return `${ordinal(date.getDate())} ${month}, ${date.getFullYear()}`;
};

// "10:45am - 24/02/2025" to match the Figma "Last logged in" card. Falls back to
// the raw value when the backend already sends a preformatted string.
export const formatLastLoggedIn = (customer: Customer): string => {
  const raw = customer.lastLoggedIn || customer.lastLoginAt;
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

// Display helpers for the vendor Customers views, backed by the real
// GET /business/customers endpoint (see customers.api-slice → VendorCustomer).
// Fields the endpoint doesn't provide (email, phone, location, etc.) are shown
// as a neutral dash rather than fabricated — see [[no-stubbed-data]].

import type {
  VendorCustomer,
  CustomerOrderPreview,
} from '@/redux/services/customers/customers.api-slice';

export type CustomerStatusVariant = 'active' | 'inactive' | 'suspended';

export interface CustomerStatusInfo {
  variant: CustomerStatusVariant;
  label: string;
}

export const getCustomerStatus = (
  customer: VendorCustomer
): CustomerStatusInfo => {
  switch (customer.status) {
    case 'inactive':
      return { variant: 'inactive', label: 'Inactive' };
    case 'suspended':
      return { variant: 'suspended', label: 'Suspended' };
    default:
      return { variant: 'active', label: 'Active' };
  }
};

// Full display name, used in the detail header and CSV.
export const getCustomerName = (customer: VendorCustomer): string => {
  if (!customer) return 'Unnamed customer';
  const name = String(customer.full_name || '').trim();
  const username = String(customer.username || '').trim();
  return name || username || 'Unnamed customer';
};

// The list identifier prefers the @username, falling back to the full name.
export const getCustomerIdentifier = (customer: VendorCustomer): string => {
  if (!customer) return '—';
  const username = String(customer.username || '').trim();
  const name = String(customer.full_name || '').trim();
  return username || name || '—';
};

export const getCustomerInitial = (customer: VendorCustomer): string =>
  getCustomerName(customer).replace(/^@/, '').charAt(0).toUpperCase() || 'C';

// Most recent order date across the customer's (recent) orders.
export const getLastOrderDate = (customer: VendorCustomer): string | undefined => {
  let latest: string | undefined;
  for (const order of customer.orders ?? []) {
    if (order.createdAt && (!latest || order.createdAt > latest)) {
      latest = order.createdAt;
    }
  }
  return latest;
};

export const formatCount = (value?: number): string => {
  if (typeof value !== 'number' || Number.isNaN(value)) return '—';
  return value.toLocaleString();
};

// DD/MM/YYYY to match the "Last Order date" column in the design.
export const formatDate = (value?: string): string => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  const day = `${date.getDate()}`.padStart(2, '0');
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()}`;
};

// ---- export ----

const csvCell = (value: string | number | undefined): string => {
  const text = value === undefined || value === null ? '' : String(value);
  // Escape per RFC 4180 when the cell contains a comma, quote or newline.
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

// Build a CSV of the supplied customers and trigger a browser download. Done
// client-side from already-fetched data (no export endpoint exists).
export const exportCustomersToCsv = (
  customers: VendorCustomer[],
  fileName = 'customers.csv'
): void => {
  const header = [
    'Customer name',
    'Total orders',
    'Last Order date',
    'Status',
  ];
  const rows = customers.map((c) => [
    csvCell(getCustomerIdentifier(c)),
    csvCell(c.total_orders),
    csvCell(formatDate(getLastOrderDate(c))),
    csvCell(getCustomerStatus(c).label),
  ]);

  const csv = [header.map(csvCell), ...rows]
    .map((row) => row.join(','))
    .join('\r\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export type { VendorCustomer, CustomerOrderPreview };

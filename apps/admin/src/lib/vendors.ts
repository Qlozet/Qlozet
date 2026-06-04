// Display helpers for the admin Vendors (businesses) views.
// The backend response is permissive, so each accessor falls back across the
// handful of field names the API uses for the same concept.

import type { Business } from '@/redux/services/businesses/businesses.api-slice';

export type VendorStatusVariant = 'active' | 'awaiting' | 'inactive';

export interface VendorStatusInfo {
  variant: VendorStatusVariant;
  label: string;
}

// Collapse the many backend status strings into the three states the UI shows.
export const getVendorStatus = (vendor: Business): VendorStatusInfo => {
  const raw = (vendor.status ?? '').toString().toLowerCase();

  if (['active', 'approved', 'verified'].includes(raw)) {
    return { variant: 'active', label: 'Active' };
  }
  if (['inactive', 'rejected', 'suspended', 'disabled'].includes(raw)) {
    return { variant: 'inactive', label: 'Inactive' };
  }
  // pending / in-review / awaiting verification / unknown
  return { variant: 'awaiting', label: 'Awaiting verification' };
};

export const getVendorName = (vendor: Business): string =>
  vendor.business_name ||
  vendor.name ||
  vendor.personal_name ||
  vendor.full_name ||
  'Unnamed vendor';

export const getVendorEmail = (vendor: Business): string =>
  vendor.business_email || vendor.email || '—';

export const getVendorInitial = (vendor: Business): string =>
  getVendorName(vendor).charAt(0).toUpperCase() || 'V';

// Naira-formatted currency, e.g. ₦180,000
export const formatNaira = (value?: number): string => {
  if (typeof value !== 'number' || Number.isNaN(value)) return '—';
  return `₦${value.toLocaleString()}`;
};

export const formatCount = (value?: number): string => {
  if (typeof value !== 'number' || Number.isNaN(value)) return '—';
  return value.toLocaleString();
};

// DD/MM/YYYY to match the Figma "Date onboarded" column.
export const formatOnboardedDate = (value?: string): string => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  const day = `${date.getDate()}`.padStart(2, '0');
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()}`;
};

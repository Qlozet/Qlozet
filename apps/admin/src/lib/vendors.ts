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

export const getVendorEmail = (vendor: Business): string => {
  const owner = vendor.vendor as { email?: string } | undefined;
  const createdBy = vendor.created_by as { email?: string } | undefined;

  // Falls through to the owning vendor's own address: a business can be
  // registered without a business_email, and the row showed a bare dash even
  // though the account behind it has one.
  return (
    vendor.business_email ||
    vendor.email ||
    owner?.email ||
    createdBy?.email ||
    '—'
  );
};

/**
 * The vendor's logo, when they have uploaded one.
 *
 * `business_logo_url` is an empty string on most records rather than absent,
 * so a truthiness check is what decides between the photo and the initial.
 */
/**
 * The vendor's cover banner, when they have uploaded one.
 *
 * The API field is `cover_image_url`. The detail header read `cover_image` and
 * `banner` — names the endpoint has never sent — so the banner was always the
 * grey placeholder gradient no matter what the vendor uploaded.
 */
export const getVendorCover = (vendor: Business): string | undefined => {
  const raw = vendor.cover_image_url ?? vendor.cover_image ?? vendor.banner;
  return typeof raw === 'string' && raw.trim() ? raw.trim() : undefined;
};

export const getVendorLogo = (vendor: Business): string | undefined => {
  const raw = vendor.business_logo_url ?? vendor.display_picture_url;
  return typeof raw === 'string' && raw.trim() ? raw.trim() : undefined;
};

export const getVendorInitial = (vendor: Business): string =>
  getVendorName(vendor).charAt(0).toUpperCase() || 'V';

// Re-exported so the vendor screens and everything else format money the same
// way. This used to be a second implementation with the same name.
export { formatNaira } from './orders';

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

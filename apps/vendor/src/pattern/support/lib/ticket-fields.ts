// Tolerant field accessors for ticket rows.
//
// The backend's ticket response shape isn't documented in Swagger, so rows
// arrive loosely typed (the Ticket interface exposes most keys as `unknown`).
// These helpers read the most likely keys and fall back to an honest "—" /
// null rather than fabricating values.

import type { BadgeProps } from '@/components/ui/badge';

export type Row = Record<string, unknown>;

const asDict = (v: unknown): Row =>
  v && typeof v === 'object' ? (v as Row) : {};

const str = (v: unknown): string | undefined =>
  typeof v === 'string' && v.trim() ? v.trim() : undefined;

// Pull a display name out of a populated relation object.
const nestedName = (v: unknown): string | undefined => {
  const o = asDict(v);
  return (
    str(o.username) ??
    str(o.full_name) ??
    str(o.name) ??
    str(o.business_name) ??
    str(o.email)
  );
};

// User / Vendor name column.
export const readName = (t: Row): string =>
  str(t.user_name) ??
  str(t.vendor_name) ??
  str(t.customer_name) ??
  nestedName(t.user) ??
  nestedName(t.customer) ??
  nestedName(t.vendor) ??
  '—';

// "Assigned To" — null when unassigned so the UI can flag it.
export const readAssigned = (t: Row): string | null =>
  str(t.assigned_to_name) ??
  nestedName(t.assigned_to) ??
  str(t.assigned_to) ??
  null;

export const readField = (t: Row, ...keys: string[]): string => {
  for (const key of keys) {
    const value = str(t[key]);
    if (value) return value;
  }
  return '—';
};

// Format an ISO timestamp down to YYYY-MM-DD; pass through anything else.
export const formatDate = (value: unknown): string => {
  const s = str(value);
  if (!s) return '—';
  return s.includes('T') ? s.slice(0, 10) : s;
};

export const statusVariant = (status?: string): BadgeProps['variant'] => {
  const s = (status ?? '').toLowerCase();
  if (['resolved', 'closed', 'completed'].includes(s)) return 'success';
  if (['open', 'rejected', 'failed'].includes(s)) return 'error';
  return 'warning';
};

export const statusLabel = (status?: string): string => {
  const s = str(status);
  if (!s) return 'Pending';
  return s.charAt(0).toUpperCase() + s.slice(1);
};

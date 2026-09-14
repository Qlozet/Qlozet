// Tolerant field accessors for ticket rows.
//
// The backend's ticket response shape isn't documented in Swagger, so rows
// arrive loosely typed (the Ticket interface exposes most keys as `unknown`).
// These helpers read the most likely keys and fall back to an honest "—" /
// null rather than fabricating values.

import type { BadgeProps } from '@/components/ui/badge';
import {
  Bug,
  CreditCard,
  Lightbulb,
  Package,
  Ticket,
  UserRound,
  type LucideIcon,
} from 'lucide-react';

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

// "May 25, 2023 . 12:25pm" — matches the tickets list / detail header design.
export const formatDateTime = (value: unknown): string => {
  const s = str(value);
  if (!s) return '—';
  const date = new Date(s);
  if (Number.isNaN(date.getTime())) return s;
  const datePart = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const timePart = date
    .toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
    .replace(/\s/g, '')
    .toLowerCase();
  return `${datePart} . ${timePart}`;
};

// Issue types offered by the vendor "Get support" form. The backend stores the
// raw value it was sent, so this map is what turns it back into display copy.
export const ISSUE_TYPES = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'pricing', label: 'Pricing' },
  { value: 'feature', label: 'Feature Request' },
  { value: 'bugs', label: 'Bugs and Issues' },
  { value: 'others', label: 'Others' },
];

// Category → icon + colour. Keyword-matched so free-text issue types
// ("Delivery Delay", "Payment or wallet") land in the right bucket too;
// anything unrecognised gets the neutral ticket look. Deterministic per
// category — the old list coloured icons by row INDEX, so the same ticket
// changed colour whenever the list reordered.
export const issueTypeVisual = (
  value: unknown
): { icon: LucideIcon; color: string } => {
  const v = (str(value) ?? '').toLowerCase();
  if (/pricing|payment|wallet|payout|billing|refund/.test(v))
    return { icon: CreditCard, color: '#E8A33D' };
  if (/bug|issue|error|technical|broken|crash/.test(v))
    return { icon: Bug, color: '#E4572E' };
  if (/feature|request|suggestion|idea/.test(v))
    return { icon: Lightbulb, color: '#8B5CF6' };
  if (/deliver|shipping|order|logistics|courier/.test(v))
    return { icon: Package, color: '#3387CC' };
  if (/account|login|profile|verification/.test(v))
    return { icon: UserRound, color: '#2EA86A' };
  return { icon: Ticket, color: '#64748B' };
};

// Tickets can also be created outside this form (the Swagger example is free
// text, e.g. "Delivery Delay"), so unknown values pass through untouched.
export const issueTypeLabel = (value: unknown): string => {
  const s = str(value);
  if (!s) return '—';
  return ISSUE_TYPES.find((t) => t.value === s.toLowerCase())?.label ?? s;
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

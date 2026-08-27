import type {
  Dispute,
  DisputeReason,
  DisputeStatus,
  DisputeBusinessRef,
  DisputeCustomerRef,
} from '@/redux/services/disputes/disputes.api-slice';

export const REASON_LABELS: Record<DisputeReason, string> = {
  wrong_item: 'Wrong item',
  damaged: 'Damaged',
  not_as_described: 'Not as described',
  poor_quality: 'Poor quality',
  missing_items: 'Missing items',
  measurement_issue: 'Measurement issue',
  other: 'Other',
};

type BadgeVariant = 'success' | 'warning' | 'error' | 'blue' | 'secondary';

export const STATUS_META: Record<
  DisputeStatus,
  { label: string; variant: BadgeVariant }
> = {
  open: { label: 'Open', variant: 'warning' },
  under_review: { label: 'Under review', variant: 'blue' },
  resolved_refund: { label: 'Refunded', variant: 'success' },
  resolved_partial: { label: 'Partial refund', variant: 'success' },
  resolved_released: { label: 'Released to vendor', variant: 'secondary' },
  closed: { label: 'Closed', variant: 'secondary' },
};

/** A dispute the admin can still act on. */
export const OPEN_STATUSES: DisputeStatus[] = ['open', 'under_review'];

export function isActionable(status: DisputeStatus): boolean {
  return OPEN_STATUSES.includes(status);
}

export function customerName(c: DisputeCustomerRef | string): string {
  if (!c || typeof c === 'string') return '—';
  const name = [c.first_name, c.last_name].filter(Boolean).join(' ').trim();
  return name || c.email || '—';
}

export function vendorName(b: DisputeBusinessRef | string): string {
  if (!b || typeof b === 'string') return '—';
  return b.business_name || '—';
}

export function formatDate(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'under_review', label: 'Under review' },
  { value: 'resolved_refund', label: 'Refunded' },
  { value: 'resolved_partial', label: 'Partial refund' },
  { value: 'resolved_released', label: 'Released' },
  { value: 'closed', label: 'Closed' },
];

export type { Dispute };

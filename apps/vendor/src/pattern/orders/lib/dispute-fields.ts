// Tolerant field readers + status badge for vendor Disputes.
// The /disputes response shape is undocumented, so every field is read
// defensively (see disputes.api-slice.ts).

import type { Dispute } from '@/redux/services/disputes/disputes.api-slice';
import type { StatusBadge } from './order-fields';

// Statuses that mean the dispute is settled (no vendor action, earnings unfrozen).
const TERMINAL_STATUSES = ['resolved', 'closed', 'rejected', 'refunded', 'cancelled'];

export const readDisputeRef = (d: Dispute): string =>
  d.order_reference ||
  (d.order_id ? String(d.order_id) : '') ||
  d._id ||
  '—';

export const readDisputeReason = (d: Dispute): string =>
  (d.reason ?? d.description ?? '').trim() || '—';

export const readDisputeCustomer = (d: Dispute): string =>
  d.customer?.username || d.customer?.email || '—';

export const readDisputeStatus = (d: Dispute): string =>
  String(d.status ?? 'open').toLowerCase();

// The vendor can still respond while the dispute is live and not yet answered.
export const canRespond = (d: Dispute): boolean => {
  const status = readDisputeStatus(d);
  if (TERMINAL_STATUSES.includes(status)) return false;
  return true;
};

export const disputeStatusBadge = (status: string): StatusBadge => {
  const map: Record<string, StatusBadge> = {
    open: { label: 'Open', className: 'bg-[#FEF6E7] text-[#DD900D]' },
    under_review: { label: 'Under Review', className: 'bg-[#E7F0FA] text-[#3387CC]' },
    vendor_responded: { label: 'Responded', className: 'bg-[#F4EBFF] text-[#7E22CE]' },
    resolved: { label: 'Resolved', className: 'bg-[#E7F6EC] text-[#0F973D]' },
    refunded: { label: 'Refunded', className: 'bg-[#E7F6EC] text-[#0F973D]' },
    rejected: { label: 'Rejected', className: 'bg-[#FBEAE9] text-[#D42620]' },
    closed: { label: 'Closed', className: 'bg-[#EAECF0] text-[#475467]' },
  };
  return (
    map[status] ?? {
      label: status ? status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ') : 'Unknown',
      className: 'bg-[#EAECF0] text-[#475467]',
    }
  );
};

export type DisputeStatusFilter =
  | 'all'
  | 'open'
  | 'under_review'
  | 'vendor_responded'
  | 'resolved'
  | 'rejected';

// Whether an order's vendor earnings are frozen by an active dispute. The order
// object may carry this a few different ways depending on the backend; read them
// all tolerantly and treat a settled dispute as not frozen.
export const isEarningsFrozen = (order: unknown): boolean => {
  const o = (order ?? {}) as Record<string, unknown>;
  if (o.earnings_frozen === true || o.has_dispute === true) return true;
  const ds = String(o.dispute_status ?? '').toLowerCase();
  if (ds && !TERMINAL_STATUSES.includes(ds) && ds !== 'none') return true;
  const d = o.dispute as Record<string, unknown> | undefined;
  if (d && d.status) {
    return !TERMINAL_STATUSES.includes(String(d.status).toLowerCase());
  }
  return false;
};
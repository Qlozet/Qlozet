// Tolerant field readers + status badge for vendor Returns.
// The /returns response shape is undocumented, so every field is read
// defensively (see returns.api-slice.ts).

import type { ReturnRequest } from '@/redux/services/returns/returns.api-slice';
import type { StatusBadge } from './order-fields';

export const readReturnRef = (r: ReturnRequest): string =>
  r.order_reference || (r.order_id ? String(r.order_id) : '') || r._id || '—';

// The customer's reason, in words (the backend stores an enum).
const REASON_LABELS: Record<string, string> = {
  wrong_size: 'Wrong size',
  wrong_item: 'Wrong item',
  damaged: 'Damaged',
  not_as_described: 'Not as described',
  changed_mind: 'Changed mind',
  other: 'Other',
};

export const readReturnReason = (r: ReturnRequest): string => {
  const raw = (r.reason ?? '').trim();
  return REASON_LABELS[raw] ?? (raw ? raw.replace(/_/g, ' ') : '—');
};

export const readReturnCustomer = (r: ReturnRequest): string =>
  (r.customer?.full_name as string | undefined) ||
  r.customer?.username ||
  r.customer?.email ||
  '—';

export const readReturnStatus = (r: ReturnRequest): string =>
  String(r.status ?? 'requested').toLowerCase();

/** The backend's lifecycle: requested → vendor_approved → (return_shipped) →
 *  received → refund_processed, or vendor_rejected. */
export const returnStatusBadge = (status: string): StatusBadge => {
  const map: Record<string, StatusBadge> = {
    requested: {
      label: 'Waiting for you',
      className: 'bg-[#FEF6E7] text-[#DD900D]',
    },
    vendor_approved: {
      label: 'Approved · on its way back',
      className: 'bg-[#E7F0FA] text-[#3387CC]',
    },
    return_shipped: {
      label: 'On its way back',
      className: 'bg-[#E7F0FA] text-[#3387CC]',
    },
    received: { label: 'Received', className: 'bg-[#F4EBFF] text-[#7E22CE]' },
    refund_processed: {
      label: 'Refunded',
      className: 'bg-[#E7F6EC] text-[#0F973D]',
    },
    vendor_rejected: {
      label: 'Rejected',
      className: 'bg-[#FBEAE9] text-[#D42620]',
    },
    closed: { label: 'Closed', className: 'bg-[#EAECF0] text-[#475467]' },
  };
  return (
    map[status] ?? {
      label: status
        ? status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ')
        : 'Unknown',
      className: 'bg-[#EAECF0] text-[#475467]',
    }
  );
};

/** Approve / reject: only while the vendor has not answered. */
export const canDecideReturn = (status: string) => status === 'requested';
/** Mark received: once approved (and while it is on its way back). */
export const canMarkReceived = (status: string) =>
  status === 'vendor_approved' || status === 'return_shipped';

// The statuses a vendor can filter by — the backend's own values.
export type ReturnStatusFilter =
  | 'all'
  | 'requested'
  | 'vendor_approved'
  | 'refund_processed'
  | 'vendor_rejected';

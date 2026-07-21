// Tolerant field readers + status badge for vendor Returns.
// The /returns response shape is undocumented, so every field is read
// defensively (see returns.api-slice.ts).

import type { ReturnRequest } from '@/redux/services/returns/returns.api-slice';
import type { StatusBadge } from './order-fields';

export const readReturnRef = (r: ReturnRequest): string =>
  r.order_reference ||
  (r.order_id ? String(r.order_id) : '') ||
  r._id ||
  '—';

export const readReturnReason = (r: ReturnRequest): string =>
  (r.reason ?? '').trim() || '—';

export const readReturnCustomer = (r: ReturnRequest): string =>
  r.customer?.username || r.customer?.email || '—';

export const readReturnStatus = (r: ReturnRequest): string =>
  String(r.status ?? 'pending').toLowerCase();

export const returnStatusBadge = (status: string): StatusBadge => {
  const map: Record<string, StatusBadge> = {
    pending: { label: 'Pending', className: 'bg-[#FEF6E7] text-[#DD900D]' },
    approved: { label: 'Approved', className: 'bg-[#E7F0FA] text-[#3387CC]' },
    rejected: { label: 'Rejected', className: 'bg-[#FBEAE9] text-[#D42620]' },
    received: { label: 'Received', className: 'bg-[#F4EBFF] text-[#7E22CE]' },
    refunded: { label: 'Refunded', className: 'bg-[#E7F6EC] text-[#0F973D]' },
  };
  return (
    map[status] ?? {
      label: status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown',
      className: 'bg-[#EAECF0] text-[#475467]',
    }
  );
};

// The statuses a vendor can filter by (mirrors the lifecycle).
export type ReturnStatusFilter =
  | 'all'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'received'
  | 'refunded';
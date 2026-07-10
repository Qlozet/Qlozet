// Accessors + formatters for vendor order rows (reconciled with backend).
//
// Uses the real Order type from orders.api-slice.ts. The helpers are tolerant
// of missing fields because the API response can have optional/null values.

import type {
  Order,
  OrderStatus,
  ShipmentStatus,
} from '@/redux/services/orders/orders.api-slice';

// ──────────────── Formatters ────────────────

export const formatNaira = (value?: number): string =>
  typeof value === 'number' && !Number.isNaN(value)
    ? `NGN ${value.toLocaleString()}`
    : '—';

// DD/MM/YYYY — used in the Orders table.
export const formatDate = (value?: unknown): string => {
  const s = typeof value === 'string' && value.trim() ? value.trim() : undefined;
  if (!s) return '—';
  const date = new Date(s);
  if (Number.isNaN(date.getTime())) return s;
  const day = `${date.getDate()}`.padStart(2, '0');
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()}`;
};

// "12 Oct. 2023" — used in the quote drawer header.
export const formatLongDate = (value?: unknown): string => {
  const s = typeof value === 'string' && value.trim() ? value.trim() : undefined;
  if (!s) return '—';
  const date = new Date(s);
  if (Number.isNaN(date.getTime())) return s;
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

// ──────────────── Field Readers ────────────────

export const readOrderId = (o: Order): string => o.reference ?? o._id;

export const readCustomerName = (o: Order): string => {
  const c = o.customer;
  if (!c) return '—';
  const parts = [c.firstName, c.lastName].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : c.email ?? '—';
};

export const readCustomerHandle = (o: Order): string => {
  const name = readCustomerName(o);
  return name.startsWith('@') ? name : `@${name}`;
};

export const readItemsCount = (o: Order): number =>
  Array.isArray(o.items) ? o.items.length : 0;

export const readAmountPaid = (o: Order): number | undefined => o.total;

export const readProductPrice = (o: Order): number | undefined => o.subtotal;

export const readStatus = (o: Order): OrderStatus => o.status ?? 'pending';

// Custom (bespoke) orders open the quote builder instead of the standard drawer.
export const isCustomOrder = (o: Order): boolean =>
  o.type === 'bespoke' || Boolean(o.bespoke_design) || Boolean(o.bespoke_quote);

export const readQuoteId = (o: Order): string =>
  o.bespoke_quote ?? o._id;

// ──────────────── Order-Status Badge ────────────────

export interface StatusBadge {
  label: string;
  className: string;
}

export const orderStatusBadge = (status: OrderStatus): StatusBadge => {
  const map: Record<OrderStatus, StatusBadge> = {
    pending: {
      label: 'Pending',
      className: 'bg-[#FEF6E7] text-[#DD900D]',
    },
    in_review: {
      label: 'In Review',
      className: 'bg-[#E7F0FA] text-[#3387CC]',
    },
    processing: {
      label: 'Processing',
      className: 'bg-[#F4EBFF] text-[#7E22CE]',
    },
    in_transit: {
      label: 'In Transit',
      className: 'bg-[#EAECF0] text-[#475467]',
    },
    completed: {
      label: 'Completed',
      className: 'bg-[#E7F6EC] text-[#0F973D]',
    },
    cancelled: {
      label: 'Cancelled',
      className: 'bg-[#FBEAE9] text-[#D42620]',
    },
    returned: {
      label: 'Returned',
      className: 'bg-[#FEECEB] text-[#D42620]',
    },
  };
  return (
    map[status] ?? {
      label: status.charAt(0).toUpperCase() + status.slice(1),
      className: 'bg-[#EAECF0] text-[#475467]',
    }
  );
};

// Backward-compatible alias used in the table columns and drawers.
export const deliveryBadge = orderStatusBadge;

// ──────────────── Shipment-Status Badge ────────────────

export const shipmentStatusBadge = (status: ShipmentStatus): StatusBadge => {
  const map: Record<ShipmentStatus, StatusBadge> = {
    pending: {
      label: 'Pending',
      className: 'bg-[#FEF6E7] text-[#DD900D]',
    },
    ready_to_ship: {
      label: 'Ready to Ship',
      className: 'bg-[#E7F0FA] text-[#3387CC]',
    },
    shipped: {
      label: 'Shipped',
      className: 'bg-[#F4EBFF] text-[#7E22CE]',
    },
    in_transit: {
      label: 'In Transit',
      className: 'bg-[#EAECF0] text-[#475467]',
    },
    delivered: {
      label: 'Delivered',
      className: 'bg-[#E7F6EC] text-[#0F973D]',
    },
    failed: {
      label: 'Failed',
      className: 'bg-[#FBEAE9] text-[#D42620]',
    },
  };
  return (
    map[status] ?? {
      label: status.charAt(0).toUpperCase() + status.slice(1),
      className: 'bg-[#EAECF0] text-[#475467]',
    }
  );
};

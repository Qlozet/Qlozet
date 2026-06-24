// Tolerant accessors + formatters for vendor order rows.
//
// GET /orders/vendor has no documented response shape, so rows arrive loosely
// typed. These helpers read the most likely keys and fall back gracefully.

export type OrderRow = Record<string, unknown> & { _id: string };

const asDict = (v: unknown): Record<string, unknown> =>
  v && typeof v === 'object' ? (v as Record<string, unknown>) : {};

const str = (v: unknown): string | undefined =>
  typeof v === 'string' && v.trim() ? v.trim() : undefined;

const num = (v: unknown): number | undefined =>
  typeof v === 'number' && !Number.isNaN(v) ? v : undefined;

const firstItem = (o: OrderRow): Record<string, unknown> => {
  const items = Array.isArray(o.items) ? o.items : [];
  return asDict(items[0]);
};

export const formatNaira = (value?: number): string =>
  typeof value === 'number' && !Number.isNaN(value)
    ? `NGN ${value.toLocaleString()}`
    : '—';

// DD/MM/YYYY to match the Orders table.
export const formatDate = (value?: unknown): string => {
  const s = str(value);
  if (!s) return '—';
  const date = new Date(s);
  if (Number.isNaN(date.getTime())) return s;
  const day = `${date.getDate()}`.padStart(2, '0');
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()}`;
};

// "12 Oct. 2023" — used in the order detail drawer header.
export const formatLongDate = (value?: unknown): string => {
  const s = str(value);
  if (!s) return '—';
  const date = new Date(s);
  if (Number.isNaN(date.getTime())) return s;
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const readOrderId = (o: OrderRow): string =>
  str(o.reference) ?? str(o.orderNumber) ?? str(o.order_id) ?? o._id;

export const readCustomerName = (o: OrderRow): string =>
  str(o.customerName) ??
  str(o.customer_name) ??
  str(asDict(o.customer).full_name) ??
  str(asDict(o.customer).username) ??
  str(asDict(o.customer).name) ??
  '—';

export const readCustomerHandle = (o: OrderRow): string => {
  const handle =
    str(asDict(o.customer).username) ??
    str(o.customer_username) ??
    readCustomerName(o);
  return handle.startsWith('@') ? handle : `@${handle}`;
};

export const readItemsCount = (o: OrderRow): number =>
  (Array.isArray(o.items) ? o.items.length : undefined) ??
  num(o.total_items) ??
  num(o.items_count) ??
  num(firstItem(o).quantity) ??
  1;

export const readAmountPaid = (o: OrderRow): number | undefined =>
  num(o.amount_paid) ?? num(o.total) ?? num(o.amount);

export const readProductPrice = (o: OrderRow): number | undefined =>
  num(o.product_price) ?? num(firstItem(o).price) ?? num(o.subtotal);

export const readStatus = (o: OrderRow): string =>
  (str(o.delivery_status) ?? str(o.status) ?? 'pending').toLowerCase();

// Custom (bespoke) orders open the quote builder instead of the standard drawer.
export const isCustomOrder = (o: OrderRow): boolean =>
  Boolean(
    o.is_custom ||
      o.bespoke ||
      o.quote ||
      o.quote_id ||
      ['custom', 'bespoke'].includes(str(o.order_type)?.toLowerCase() ?? '') ||
      ['custom', 'bespoke'].includes(str(o.type)?.toLowerCase() ?? '')
  );

export const readQuoteId = (o: OrderRow): string =>
  str(o.quote_id) ?? str(asDict(o.quote)._id) ?? readOrderId(o);

// Delivery-status pill: label + colour classes, matching the design.
export interface DeliveryBadge {
  label: string;
  className: string;
}

export const deliveryBadge = (status: string): DeliveryBadge => {
  const s = status.toLowerCase().replace(/[\s-]+/g, '_');
  const map: Record<string, DeliveryBadge> = {
    out_for_delivery: { label: 'Out for delivery', className: 'bg-[#EAECF0] text-[#475467]' },
    pending: { label: 'Pending', className: 'bg-[#FEF6E7] text-[#DD900D]' },
    processing: { label: 'Pending', className: 'bg-[#FEF6E7] text-[#DD900D]' },
    return: { label: 'Return', className: 'bg-[#F4EBFF] text-[#7E22CE]' },
    returned: { label: 'Return', className: 'bg-[#F4EBFF] text-[#7E22CE]' },
    successful: { label: 'Successful', className: 'bg-[#E7F6EC] text-[#0F973D]' },
    delivered: { label: 'Successful', className: 'bg-[#E7F6EC] text-[#0F973D]' },
    completed: { label: 'Successful', className: 'bg-[#E7F6EC] text-[#0F973D]' },
    failed: { label: 'Failed', className: 'bg-[#FBEAE9] text-[#D42620]' },
    rejected: { label: 'Rejected', className: 'bg-[#FEECEB] text-[#D42620]' },
    cancelled: { label: 'Rejected', className: 'bg-[#FEECEB] text-[#D42620]' },
    ready_to_ship: { label: 'Ready to ship', className: 'bg-[#E7F0FA] text-[#3387CC]' },
    shipped: { label: 'Ready to ship', className: 'bg-[#E7F0FA] text-[#3387CC]' },
  };
  return map[s] ?? { label: status.charAt(0).toUpperCase() + status.slice(1), className: 'bg-[#EAECF0] text-[#475467]' };
};

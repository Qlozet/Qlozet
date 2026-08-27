// Accessors, formatters and filters for admin order rows.
//
// The backend response for `/admin/vendor/orders` is untyped in Swagger, so
// every reader tolerates missing fields and returns a neutral em-dash rather
// than a fabricated value.

import type {
  AdminOrder,
  AdminOrderItem,
} from '@/redux/services/orders/orders.api-slice';

const DASH = '—';

// ──────────────── Formatters ────────────────

export const formatNaira = (value?: unknown): string =>
  typeof value === 'number' && !Number.isNaN(value)
    ? `NGN ${value.toLocaleString()}`
    : DASH;

// DD/MM/YYYY, matching the Orders table design.
export const formatOrderDate = (value?: unknown): string => {
  const raw =
    typeof value === 'string' && value.trim() ? value.trim() : undefined;
  if (!raw) return DASH;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  const day = `${date.getDate()}`.padStart(2, '0');
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()}`;
};

export const formatItemsCount = (count: number): string =>
  `${count} ${count === 1 ? 'item' : 'items'}`;

// ──────────────── Field Readers ────────────────

export const readOrderId = (order: AdminOrder): string =>
  order.reference ?? order._id ?? DASH;

export const readCustomerName = (order: AdminOrder): string => {
  const customer = order.customer;
  if (!customer || typeof customer === 'string') return DASH;
  if (customer.username) return customer.username;
  const parts = [customer.firstName, customer.lastName].filter(Boolean);
  if (parts.length > 0) return parts.join(' ');
  return customer.email ?? DASH;
};

export const readItemsCount = (order: AdminOrder): number =>
  Array.isArray(order.items) ? order.items.length : 0;

/** Value of the goods before shipping. */
export const readProductPrice = (order: AdminOrder): number | undefined =>
  typeof order.subtotal === 'number' ? order.subtotal : undefined;

/** Total charged to the customer, shipping included. */
export const readAmountPaid = (order: AdminOrder): number | undefined =>
  typeof order.total === 'number' ? order.total : undefined;

export const readStatus = (order: AdminOrder): string =>
  typeof order.status === 'string' && order.status.trim()
    ? order.status
    : 'pending';

/** Product name of the order's first item, when the product is populated. */
export const readFirstProductName = (order: AdminOrder): string | undefined => {
  const item = order.items?.[0];
  const product = item?.product;
  if (!product || typeof product !== 'object') return undefined;
  const p = product as Record<string, any>;
  const name =
    p.clothing?.name ?? p.fabric?.name ?? p.accessory?.name ?? p.name;
  return typeof name === 'string' && name.trim() ? name : undefined;
};

/** Payment / refund state, or undefined when the backend didn't supply it. */
export const readPaymentStatus = (order: AdminOrder): string | undefined =>
  typeof order.payment_status === 'string' && order.payment_status.trim()
    ? order.payment_status
    : undefined;

export const readRefundStatus = (order: AdminOrder): string | undefined => {
  if (typeof order.refund_status === 'string' && order.refund_status.trim())
    return order.refund_status;
  if (typeof order.refunded === 'boolean')
    return order.refunded ? 'Refunded' : 'Not refunded';
  return undefined;
};

// ──────────────── Order Items ────────────────

export interface OrderItemPricing {
  /** Amount actually charged for this item. */
  final?: number;
  /** Pre-discount amount — only set when a discount was applied. */
  original?: number;
  /** Discount value in Naira, when greater than zero. */
  discount?: number;
  /** Total units across every selection on the item. */
  quantity: number;
}

const sumQuantities = (selections?: { quantity?: number }[]): number =>
  (selections ?? []).reduce((sum, s) => sum + (s.quantity ?? 0), 0);

/**
 * Read an item's money + quantity from the frozen `pricing` snapshot, falling
 * back to `total_price` / summed selections on older orders that predate it.
 */
export const readItemPricing = (item: AdminOrderItem): OrderItemPricing => {
  const pricing = item.pricing;
  const final = pricing?.final ?? item.total_price;

  const discount =
    typeof pricing?.discount === 'number' && pricing.discount > 0
      ? pricing.discount
      : undefined;

  // Only show a struck-through price when it genuinely differs from what was
  // charged — otherwise the row implies a discount that wasn't applied.
  const original =
    discount !== undefined &&
    typeof pricing?.before_discount === 'number' &&
    pricing.before_discount !== final
      ? pricing.before_discount
      : undefined;

  const quantity =
    sumQuantities(item.color_variant_selections) +
    sumQuantities(item.fabric_selections) +
    sumQuantities(item.style_selections) +
    sumQuantities(item.accessory_selections) +
    sumQuantities(item.addon_selections);

  return {
    final,
    original,
    discount,
    quantity: quantity > 0 ? quantity : (item.quantity ?? 0),
  };
};

/** Display name for a single order item. */
export const readItemName = (item: AdminOrderItem): string => {
  const product = item.product;
  if (!product || typeof product !== 'object') return 'Product';
  const p = product as Record<string, any>;
  return (
    p.clothing?.name ??
    p.fabric?.name ??
    p.accessory?.name ??
    p.name ??
    'Product'
  );
};

/** First image URL for a single order item, or null when none is populated. */
export const readItemImage = (item: AdminOrderItem): string | null => {
  const product = item.product;
  if (!product || typeof product !== 'object') return null;
  const p = product as Record<string, any>;

  const kindImages =
    p.clothing?.images ?? p.fabric?.images ?? p.accessory?.images;
  if (Array.isArray(kindImages) && kindImages.length) {
    const first = kindImages[0];
    if (first && typeof first === 'object' && first.url) return first.url;
  }

  if (Array.isArray(p.images) && p.images.length) {
    const first = p.images[0];
    if (typeof first === 'string') return first;
    if (first && typeof first === 'object' && first.url) return first.url;
  }
  return null;
};

// ──────────────── Delivery-Status Badge ────────────────

export interface OrderStatusBadge {
  label: string;
  className: string;
}

const STATUS_BADGES: Record<string, OrderStatusBadge> = {
  pending: { label: 'Pending', className: 'bg-[#FEF6E7] text-[#DD900D]' },
  in_review: { label: 'In review', className: 'bg-[#E7F0FA] text-[#3387CC]' },
  processing: { label: 'Processing', className: 'bg-[#F4EBFF] text-[#7E22CE]' },
  ready_to_ship: {
    label: 'Ready to ship',
    className: 'bg-[#E3F1FC] text-[#2B90D9]',
  },
  in_transit: {
    label: 'Out for delivery',
    className: 'bg-[#EAECF0] text-[#475467]',
  },
  completed: { label: 'Successful', className: 'bg-[#E7F6EC] text-[#0F973D]' },
  cancelled: { label: 'Rejected', className: 'bg-[#FBEAE9] text-[#D42620]' },
  returned: { label: 'Return', className: 'bg-[#F4EBFF] text-[#7E22CE]' },
  failed: { label: 'Failed', className: 'bg-[#FEECEB] text-[#D42620]' },
};

export const orderStatusBadge = (status: string): OrderStatusBadge =>
  STATUS_BADGES[status] ?? {
    label: status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    className: 'bg-[#EAECF0] text-[#475467]',
  };

/** Status values offered in the table's "Filter By" menu. */
export const ORDER_STATUS_OPTIONS: { value: string; label: string }[] = [
  'pending',
  'in_review',
  'processing',
  'in_transit',
  'completed',
  'cancelled',
  'returned',
].map((value) => ({ value, label: orderStatusBadge(value).label }));

// ──────────────── Period Filter ────────────────

export type OrderPeriod = 'week' | 'month' | 'year' | 'all';

export const ORDER_PERIOD_OPTIONS: { value: OrderPeriod; label: string }[] = [
  { value: 'week', label: 'This week' },
  { value: 'month', label: 'This month' },
  { value: 'year', label: 'This year' },
  { value: 'all', label: 'All time' },
];

/** Inclusive lower bound for a period, or undefined for "all time". */
export const periodStartDate = (
  period: OrderPeriod,
  now: Date = new Date()
): Date | undefined => {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  switch (period) {
    case 'week': {
      // Week starts on Monday.
      const dayOffset = (start.getDay() + 6) % 7;
      start.setDate(start.getDate() - dayOffset);
      return start;
    }
    case 'month':
      start.setDate(1);
      return start;
    case 'year':
      start.setMonth(0, 1);
      return start;
    case 'all':
    default:
      return undefined;
  }
};

export const filterOrdersByPeriod = (
  orders: AdminOrder[],
  period: OrderPeriod
): AdminOrder[] => {
  const start = periodStartDate(period);
  if (!start) return orders;
  return orders.filter((order) => {
    if (typeof order.createdAt !== 'string') return false;
    const created = new Date(order.createdAt);
    return !Number.isNaN(created.getTime()) && created >= start;
  });
};

/** Case-insensitive match across the fields shown in the table. */
export const searchOrders = (
  orders: AdminOrder[],
  term: string
): AdminOrder[] => {
  const needle = term.trim().toLowerCase();
  if (!needle) return orders;
  return orders.filter((order) =>
    [
      readOrderId(order),
      readCustomerName(order),
      readFirstProductName(order) ?? '',
      orderStatusBadge(readStatus(order)).label,
    ]
      .join(' ')
      .toLowerCase()
      .includes(needle)
  );
};

/**
 * Relative time string ("Just now", "12m ago", "3d ago"), falling back to a
 * short date past a week.
 *
 * Lives here rather than in each card: the orders list, the notification rows
 * and the profile drawer all render the same thing, and two of them had drifted
 * to slightly different wording and locales.
 */
export const timeAgo = (value?: string | Date | null): string => {
  if (!value) return DASH;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return DASH;

  const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

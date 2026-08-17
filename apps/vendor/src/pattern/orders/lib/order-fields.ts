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
  const s =
    typeof value === 'string' && value.trim() ? value.trim() : undefined;
  if (!s) return '—';
  const date = new Date(s);
  if (Number.isNaN(date.getTime())) return s;
  const day = `${date.getDate()}`.padStart(2, '0');
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()}`;
};

// "12 Oct. 2023" — used in the quote drawer header.
export const formatLongDate = (value?: unknown): string => {
  const s =
    typeof value === 'string' && value.trim() ? value.trim() : undefined;
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
  if (c.username) return c.username;
  const parts = [c.firstName, c.lastName].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : (c.email ?? '—');
};

export const readCustomerHandle = (o: Order): string => {
  const name = readCustomerName(o);
  return name.startsWith('@') ? name : `@${name}`;
};

export const readItemsCount = (o: Order): number =>
  Array.isArray(o.items) ? o.items.length : 0;

// On a scoped fabric transfer there is no order total to show — the vendor's
// figure is the fabric they sold, so surface that instead of a blank cell.
export const readAmountPaid = (o: Order): number | undefined =>
  o.vendor_role === 'fabric_transfer' ? o.fabric_value : o.total;

export const readProductPrice = (o: Order): number | undefined =>
  o.vendor_role === 'fabric_transfer' ? o.fabric_value : o.subtotal;

export const readStatus = (o: Order): OrderStatus => o.status ?? 'pending';

// Custom (bespoke) orders open the quote builder instead of the standard drawer.
// A scoped fabric-transfer order is never routed there — the fabric vendor must
// not see the customer's quote/design, so it always uses the plain drawer.
export const isCustomOrder = (o: Order): boolean =>
  o.vendor_role !== 'fabric_transfer' &&
  (o.type === 'bespoke' || Boolean(o.bespoke_design) || Boolean(o.bespoke_quote));

export const readQuoteId = (o: Order): string => o.bespoke_quote ?? o._id;

// ──────────────── Product image + title (bespoke-aware) ────────────────

const asPopulatedProduct = (item: any): any | null =>
  item && typeof item.product === 'object' && item.product !== null
    ? item.product
    : null;

const readBespokeDesign = (o: Order): any | null => {
  const d = (o as any).bespoke_design;
  return d && typeof d === 'object' ? d : null;
};

// First image for the order's first item; falls back to the bespoke design's
// image for custom orders (which have no catalog product).
export const readOrderImage = (o: Order): string | null => {
  const product = asPopulatedProduct(o.items?.[0]);
  if (product) {
    const kindImages =
      product.clothing?.images ??
      product.fabric?.images ??
      product.accessory?.images;
    if (Array.isArray(kindImages) && kindImages.length) {
      const first = kindImages[0];
      if (typeof first === 'object' && first?.url) return first.url;
      if (typeof first === 'string') return first;
    }
    if (Array.isArray(product.images) && product.images.length) {
      const first = product.images[0];
      if (typeof first === 'string') return first;
      if (typeof first === 'object' && first?.url) return first.url;
    }
  }
  const design = readBespokeDesign(o);
  if (design) {
    const imgs = design.design_images ?? design.reference_images;
    if (Array.isArray(imgs) && imgs.length) {
      const first = imgs[0];
      if (typeof first === 'string') return first;
      if (typeof first === 'object' && first?.url) return first.url;
    }
  }
  return null;
};

// Extract the first usable image URL from an images array (strings or {url}).
const firstImageOf = (arr: any): string | null => {
  if (Array.isArray(arr) && arr.length) {
    const first = arr[0];
    if (typeof first === 'string') return first;
    if (first && typeof first === 'object' && first.url) return first.url;
  }
  return null;
};

const productImage = (item: any): string | null => {
  const p = asPopulatedProduct(item);
  if (!p) return null;
  const kind = p.clothing?.images ?? p.fabric?.images ?? p.accessory?.images;
  return firstImageOf(kind) ?? firstImageOf(p.images);
};

// Up to `max` thumbnails for the order — one per item that has a product image,
// falling back to the bespoke design image for custom orders. Used to render the
// overlapping thumbnail stack for multi-item orders.
export const readOrderItemImages = (o: Order, max = 3): string[] => {
  const imgs: string[] = [];
  for (const item of Array.isArray(o.items) ? o.items : []) {
    const img = productImage(item);
    if (img) imgs.push(img);
    if (imgs.length >= max) break;
  }
  if (imgs.length === 0) {
    const d = readBespokeDesign(o);
    if (d) {
      const img =
        firstImageOf(d.design_images) ?? firstImageOf(d.reference_images);
      if (img) imgs.push(img);
    }
  }
  return imgs;
};

// On a scoped fabric-transfer order the vendor is only shipping fabric to a
// tailor — there are no items to name, so label the row by its destination.
const readFabricTransferTitle = (o: Order): string | null => {
  if (o.vendor_role !== 'fabric_transfer') return null;
  const transfer = (o.shipments ?? []).find(
    (s) => s.shipment_type === 'fabric_transfer'
  );
  const dest = transfer?.destination_business;
  const tailor =
    dest && typeof dest === 'object' ? dest.business_name : undefined;
  return `Fabric transfer${tailor ? ` → ${tailor}` : ''}`;
};

// Display title for the order's first item; bespoke design name for custom orders.
export const readOrderTitle = (o: Order): string => {
  const fabricTitle = readFabricTransferTitle(o);
  if (fabricTitle) return fabricTitle;
  const product = asPopulatedProduct(o.items?.[0]);
  const name =
    product?.clothing?.name ??
    product?.fabric?.name ??
    product?.accessory?.name ??
    product?.name;
  if (name) return name;
  const design = readBespokeDesign(o);
  if (design) return design.name ?? 'Custom design';
  return 'Order';
};

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

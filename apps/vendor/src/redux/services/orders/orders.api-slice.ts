// Orders API Service — RTK Query (Reconciled with Qlozet Backend)
// Only 4 real endpoints exist: getVendorOrders, fulfillOrder, cancelOrder, getOrdersChart.

import { baseAPI } from '@/redux/api/base-api';

// ──────────────── Enums ────────────────

export type OrderStatus =
  | 'pending'
  | 'in_review'
  | 'processing'
  | 'in_transit'
  | 'completed'
  | 'cancelled'
  | 'returned';

export type ShipmentStatus =
  | 'pending'
  | 'ready_to_ship'
  | 'shipped'
  | 'in_transit'
  | 'delivered'
  | 'failed';

export type OrderType = 'standard' | 'bespoke';

// ──────────────── Sub-Schemas ────────────────

export interface VariantSelection {
  variant_id: string;
  color?: string;
  /** Colour hex snapshot (for the swatch). */
  hex?: string;
  size?: string;
  price: number;
  quantity: number;
  total_amount: number;
}

export interface FabricSelection {
  fabric_id: string;
  yardage: number;
  yards?: number;
  price: number;
  quantity: number;
  total_amount: number;
}

export interface StyleSelection {
  style_id: string;
  price: number;
  quantity: number;
  total_amount: number;
}

export interface AccessorySelection {
  accessory_id: string;
  variant_id: string;
  /** Snapshots stored on the order item for display. */
  name?: string;
  color?: string;
  hex?: string;
  price: number;
  quantity: number;
  total_amount: number;
}

export interface AddonSelection {
  addon_id: string;
  variant_id: string;
  quantity: number;
  price: number;
  total_amount: number;
}

// ──────────────── Order Item ────────────────

/** Image sub-document from the product schema */
export interface ProductImage {
  public_id: string;
  url: string;
  width?: number;
  height?: number;
}

/** Embedded style sub-doc on a clothing product */
export interface ClothingStyleDoc {
  _id: string;
  name?: string;
  style_code?: string;
  type?: string;
  price?: number;
  images?: ProductImage[];
}

/** Embedded fabric sub-doc on a clothing product */
export interface ClothingFabricDoc {
  _id: string;
  name?: string;
  price_per_yard?: number;
  min_cut?: number;
  colors?: { name?: string; hex?: string }[];
  images?: ProductImage[];
}

/** Embedded accessory sub-doc on a clothing product */
export interface ClothingAccessoryDoc {
  _id: string;
  name?: string;
  price?: number;
  images?: ProductImage[];
  variants?: {
    _id?: string;
    name?: string;
    price?: number;
    images?: ProductImage[];
  }[];
}

/** Embedded add-on sub-doc on a clothing product */
export interface ClothingAddonDoc {
  _id: string;
  name?: string;
  display_type?: 'colour' | 'picture';
  variants?: {
    _id?: string;
    name?: string;
    price?: number;
    color_hex?: string;
    image_url?: string;
  }[];
}

/** Embedded colour-variant sub-doc on a clothing product */
export interface ClothingColorVariantDoc {
  _id: string;
  name?: string;
  color_name?: string;
  hex?: string;
  hex_code?: string;
  images?: ProductImage[];
  variants?: {
    _id?: string;
    size?: string;
    price?: number;
    images?: ProductImage[];
  }[];
}

/** Populated fabric product applied to a custom outfit (cross-vendor) */
export interface AppliedFabricRef {
  _id: string;
  base_price?: number;
  fabric?: { name?: string; images?: ProductImage[] };
  business?:
    | string
    | { _id: string; business_name?: string; business_logo_url?: string };
}

/** Populated product with kind-specific sub-documents */
export interface PopulatedProduct {
  _id: string;
  name?: string;
  images?: (string | ProductImage)[];
  base_price?: number;
  kind?: 'clothing' | 'fabric' | 'accessory';
  clothing?: {
    name: string;
    description?: string;
    type?: string;
    images?: ProductImage[];
    // Sub-arrays populated for the vendor order view so selections can be
    // resolved to a name + image by their id.
    styles?: ClothingStyleDoc[];
    fabrics?: ClothingFabricDoc[];
    accessories?: ClothingAccessoryDoc[];
    addons?: ClothingAddonDoc[];
    color_variants?: ClothingColorVariantDoc[];
  };
  fabric?: {
    name: string;
    images?: ProductImage[];
  };
  accessory?: {
    name: string;
    images?: ProductImage[];
  };
}

export interface OrderItem {
  /** Order-item id — target for per-item rejection. Absent on pre-migration orders. */
  _id?: string;
  /** Populated product (has name, images, base_price, kind + sub-docs) or ObjectId string */
  product: PopulatedProduct | string;
  /** The vendor's business ID */
  business: string;
  /** True when this single item was declined by the vendor. */
  rejected?: boolean;
  rejected_at?: string;
  rejection_reason?: string;
  color_variant_selections?: VariantSelection[];
  fabric_selections?: FabricSelection[];
  style_selections?: StyleSelection[];
  accessory_selections?: AccessorySelection[];
  addon_selections?: AddonSelection[];
  /** Cross-vendor fabric applied to a custom outfit — id or populated ref. */
  applied_fabric?: string | AppliedFabricRef;
  applied_fabric_yards?: number;
  note?: string;
  total_price?: number;
  /** Frozen itemized pricing snapshot at order time. `final` === total_price. */
  pricing?: {
    base: number;
    styles_total: number;
    fabric_total: number;
    variant_total: number;
    accessories_total: number;
    addons_total: number;
    /**
     * Customer-supplied external ("use my own fabric") fabric charge. This is the
     * fabric vendor's revenue — billed to the customer and added to the order
     * total, but deliberately NOT part of `final`/`total_price` (which drives the
     * tailor's earnings). Shown on the tailor's item breakdown for transparency.
     */
    external_fabric?: number;
    before_discount: number;
    discount: number;
    final: number;
  };
}

// ──────────────── Shipment Types ────────────────

export type ShipmentType = 'vendor_to_customer' | 'fabric_transfer';

// Populated business reference on shipments
export interface ShipmentBusinessRef {
  _id: string;
  business_name: string;
  business_logo_url?: string;
  // Present on a fabric transfer's destination_business (the tailor) so the
  // fabric vendor has a ship-to address. Only populated for that field.
  business_phone_number?: string;
  business_address?: string;
  validated_address?: string;
  address_line_2?: string;
  state?: string;
  city?: string;
}

// Populated fabric product reference on shipments
export interface ShipmentFabricProductRef {
  _id: string;
  fabric?: { name?: string; images?: Array<string | { url?: string }> };
  base_price?: number;
}

// ──────────────── Vendor Shipment ────────────────

export interface VendorShipment {
  _id: string;
  /** Can be a plain ID string or a populated business object */
  business: string | ShipmentBusinessRef;
  /** For fabric transfers: the receiving tailor's business */
  destination_business?: string | ShipmentBusinessRef;
  /** Type of shipment */
  shipment_type?: ShipmentType;
  /** For fabric transfers: the fabric product */
  fabric_product?: string | ShipmentFabricProductRef;
  /** For fabric transfers: how many yards */
  fabric_yards?: number;
  request_token?: string;
  service_code?: string;
  courier_id?: string;
  courier_name?: string;
  shipping_fee: number;
  shipment_id?: string;
  tracking_number?: string;
  label_url?: string;
  status: ShipmentStatus;
  confirmed?: boolean;
  confirmed_at?: string;
  rejected?: boolean;
  rejected_at?: string;
  rejection_reason?: string;
  fulfillment_deadline?: string;
  late_penalty_applied?: boolean;
  late_penalty_amount?: number;
  late_penalty_days?: number;
  rate_fetched_at?: string;
  shipped_at?: string;
  delivered_at?: string;
}

/** Extract the business ID from a shipment's business field (string or populated object) */
function extractBizId(
  biz: string | ShipmentBusinessRef | undefined
): string | undefined {
  if (!biz) return undefined;
  return typeof biz === 'string' ? biz : biz._id;
}

/** Extract the business name from a populated shipment field, with fallback */
export function extractBizName(
  biz: string | ShipmentBusinessRef | undefined
): string {
  if (!biz) return 'Vendor';
  return typeof biz === 'string' ? 'Vendor' : biz.business_name || 'Vendor';
}

/** Extract fabric product name from populated field */
export function extractFabricName(
  fp: string | ShipmentFabricProductRef | undefined
): string {
  if (!fp || typeof fp === 'string') return 'Fabric';
  return fp.fabric?.name || 'Fabric';
}

// ──────────────── Order ────────────────

export interface Order {
  _id: string;
  reference: string;
  customer: {
    _id: string;
    email: string;
    username?: string;
    firstName?: string;
    lastName?: string;
  };
  items: OrderItem[];
  /**
   * Shipping address as returned by GET /orders/vendor. The street line is
   * `address`, not `street`, and the phone is `phone_number` — the legacy
   * `street` / `phone` / `zip_code` names are kept as optional fallbacks only.
   */
  address: {
    full_name?: string;
    /** Street line, e.g. "2GR3+99Q, Gimbiya St, Garki, Abuja 900103". */
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postal_code?: string;
    phone_number?: string;
    label?: string;
    /** @deprecated legacy names — the API returns the fields above. */
    street?: string;
    zip_code?: string;
    phone?: string;
    [key: string]: unknown;
  };
  subtotal: number;
  shipping_fee: number;
  total: number;
  status: OrderStatus;
  type?: OrderType;
  bespoke_design?: string;
  bespoke_quote?: string;
  shipments: VendorShipment[];
  /**
   * Set by the backend when this vendor is on the order ONLY as the SOURCE of a
   * fabric transfer (a cross-vendor "use my own fabric" order). The order is
   * then trimmed to just that transfer — no customer, items, totals, design or
   * earnings — so the drawer/list render a scoped fabric-transfer view instead
   * of the full order. See scopeOrderForVendor on the backend.
   */
  vendor_role?: 'fabric_transfer';
  /**
   * On a scoped fabric-transfer order: the fabric vendor's gross revenue for the
   * order (the customer's "use my own fabric" charge), the platform commission
   * taken from it, and their net earnings. Released to their wallet once the
   * transfer is delivered. `payout_status` reflects THEIR earning here (not the
   * tailor's order-level payout).
   */
  fabric_value?: number;
  fabric_commission?: number;
  fabric_net?: number;
  /**
   * The requesting vendor's own money breakdown for THIS order (their items'
   * subtotal, platform commission, net). Prefer this over vendor_earnings, which
   * is order-wide and on a "use my own fabric" order also folds in the fabric
   * vendor's net.
   */
  vendor_breakdown?: {
    subtotal: number;
    commission: number;
    net: number;
  };
  vendor_earnings?: number;
  platform_commission?: number;
  payout_eligible_at?: string;
  payout_status?: 'pending' | 'eligible' | 'paid';
  customer_body_profile?: {
    body_type: string;
    confidence: string;
    measurements: Record<string, number>;
    unit: string;
    fit_preferences: string[];
  };
  createdAt: string;
  updatedAt: string;
}

// ──────────────── Paginated Response ────────────────

export interface PaginatedOrdersResponse {
  data: Order[];
  total_items: number;
  total_pages: number;
  current_page: number;
  has_next_page: boolean;
  has_previous_page: boolean;
  page_size: number;
}

// ──────────────── Vendor-Specific Helpers ────────────────
// GET /orders/vendor returns the entire order, including items and shipments
// from other vendors. The frontend must filter locally.

/** Filter order items to only show this vendor's products */
export function getVendorItems(order: Order, businessId: string): OrderItem[] {
  // order.items is absent on a scoped fabric-transfer order (see vendor_role).
  return (order.items ?? []).filter((item) => {
    const itemBiz =
      typeof item.business === 'string'
        ? item.business
        : (item.business as { _id?: string })?._id;
    return itemBiz === businessId;
  });
}

/** Get this vendor's shipment from the order */
export function getVendorShipment(
  order: Order,
  businessId: string
): VendorShipment | undefined {
  return order.shipments?.find((s) => {
    const shipBiz = extractBizId(s.business);
    return shipBiz === businessId;
  });
}

/** Goods total for one order item: the backend's item.total_price (base product
 *  price + every selection, shipping excluded), with a selection-sum fallback
 *  when total_price is missing. The fallback omits base_price so it can
 *  understate — it's a last resort, not the primary path. */
function getItemGoodsTotal(item: OrderItem): number {
  if (typeof item.total_price === 'number') return item.total_price;
  let itemTotal = 0;
  item.color_variant_selections?.forEach((v) => (itemTotal += v.total_amount));
  item.fabric_selections?.forEach((f) => (itemTotal += f.total_amount));
  item.style_selections?.forEach((s) => (itemTotal += s.total_amount));
  item.accessory_selections?.forEach((a) => (itemTotal += a.total_amount));
  item.addon_selections?.forEach((ad) => (itemTotal += ad.total_amount));
  return itemTotal;
}

/** Calculate the vendor-specific goods subtotal (this vendor's items only). */
export function getVendorSubtotal(order: Order, businessId: string): number {
  return getVendorItems(order, businessId).reduce(
    (sum, item) => sum + getItemGoodsTotal(item),
    0
  );
}

/** Goods subtotal across ALL vendors' items on the order — used to allocate an
 *  order-wide figure (e.g. order.vendor_earnings) to a single vendor's share. */
export function getOrderGoodsSubtotal(order: Order): number {
  return (order.items ?? []).reduce(
    (sum, item) => sum + getItemGoodsTotal(item),
    0
  );
}

/** Get fabric transfer shipments where this vendor is the SENDER (fabric vendor) */
export function getFabricTransferShipments(
  order: Order,
  businessId: string
): VendorShipment[] {
  return (order.shipments ?? []).filter(
    (s) =>
      s.shipment_type === 'fabric_transfer' &&
      extractBizId(s.business) === businessId
  );
}

/** Get pending incoming fabric transfers where this vendor is the RECEIVER (tailor) */
export function getPendingIncomingFabricTransfers(
  order: Order,
  businessId: string
): VendorShipment[] {
  return (order.shipments ?? []).filter(
    (s) =>
      s.shipment_type === 'fabric_transfer' &&
      extractBizId(s.destination_business) === businessId &&
      s.status !== 'delivered'
  );
}

/** Get ALL incoming fabric transfers (any status) where this vendor is the RECEIVER */
export function getIncomingFabricTransfers(
  order: Order,
  businessId: string
): VendorShipment[] {
  return (order.shipments ?? []).filter(
    (s) =>
      s.shipment_type === 'fabric_transfer' &&
      extractBizId(s.destination_business) === businessId
  );
}

export interface DashboardMetricsResponse {
  message?: string;
  data: {
    total_orders: number;
    orders_delivered: number;
    orders_in_transit: number;
    total_sales?: number;
    recent_activity?: any[];
  };
}

// ──────────────── API Slice ────────────────

export const ordersApiSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    // GET /orders/vendor — paginated vendor orders, optionally filtered by status
    getVendorOrders: builder.query<
      PaginatedOrdersResponse,
      { page?: number; size?: number; status?: OrderStatus | 'all' } | void
    >({
      query: (params) => {
        const search = new URLSearchParams();
        if (params) {
          if (params.page) search.set('page', String(params.page));
          if (params.size) search.set('size', String(params.size));
          if (params.status && params.status !== 'all')
            search.set('status', params.status);
        }
        const qs = search.toString();
        return {
          url: qs ? `/orders/vendor?${qs}` : '/orders/vendor',
          method: 'GET',
        };
      },
      providesTags: ['Orders'],
      transformResponse: (res: any) => res?.data ?? res,
    }),

    // POST /orders/:reference/fulfill — create Shipbubble shipping label
    fulfillOrder: builder.mutation<
      { message: string; data: unknown },
      {
        reference: string;
        courier_id?: string;
        service_code?: string;
      }
    >({
      query: ({ reference, ...body }) => ({
        url: `/orders/${reference}/fulfill`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Orders'],
    }),

    // PATCH /orders/cancel/:reference — cancel order and refund customer
    cancelOrder: builder.mutation<{ data: Order }, string>({
      query: (reference) => ({
        url: `/orders/cancel/${reference}`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Orders'],
    }),

    // POST /orders/:reference/confirm — vendor confirms their portion
    confirmOrder: builder.mutation<
      { message: string; data: unknown },
      { reference: string }
    >({
      query: ({ reference }) => ({
        url: `/orders/${reference}/confirm`,
        method: 'POST',
      }),
      invalidatesTags: ['Orders'],
    }),

    // PATCH /orders/:reference/reject — vendor rejects their portion (partial refund)
    rejectOrder: builder.mutation<
      { message: string; data: unknown },
      { reference: string; reason?: string }
    >({
      query: ({ reference, ...body }) => ({
        url: `/orders/${reference}/reject`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Orders'],
    }),

    // PATCH /orders/:reference/items/:itemId/reject — reject a single item
    rejectOrderItem: builder.mutation<
      { message: string; data: unknown },
      { reference: string; itemId: string; reason?: string }
    >({
      query: ({ reference, itemId, ...body }) => ({
        url: `/orders/${reference}/items/${itemId}/reject`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Orders'],
    }),

    // GET /orders/chart — dashboard chart data (summary + all charts)
    getOrdersChart: builder.query<{ data: any }, void>({
      query: () => ({ url: '/orders/chart', method: 'GET' }),
      providesTags: ['OrderStats'],
    }),

    // NOTE: getEarningsChart lives in business.api-slice.ts — it is a
    // /business/* endpoint. Declaring it here too made both slices inject the
    // same endpoint name into baseAPI, which RTK Query warns about at runtime.

    // GET /orders/dashboard — top metric cards data
    getVendorDashboardMetrics: builder.query<DashboardMetricsResponse, void>({
      query: () => ({ url: '/orders/dashboard', method: 'GET' }),
      providesTags: ['OrderStats'],
    }),
  }),
});

export const {
  useGetVendorOrdersQuery,
  useFulfillOrderMutation,
  useCancelOrderMutation,
  useConfirmOrderMutation,
  useRejectOrderMutation,
  useRejectOrderItemMutation,
  useGetOrdersChartQuery,
  useGetVendorDashboardMetricsQuery,
} = ordersApiSlice;

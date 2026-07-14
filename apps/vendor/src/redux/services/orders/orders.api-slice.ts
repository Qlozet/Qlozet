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
  size?: string;
  price: number;
  quantity: number;
  total_amount: number;
}

export interface FabricSelection {
  fabric_id: string;
  yardage: number;
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
  price: number;
  quantity: number;
  total_amount: number;
}

// ──────────────── Order Item ────────────────

export interface OrderItem {
  /** Populated product (has name, images, base_price) or ObjectId string */
  product:
    | { _id: string; name: string; images?: string[]; base_price?: number }
    | string;
  /** The vendor's business ID */
  business: string;
  color_variant_selections?: VariantSelection[];
  fabric_selections?: FabricSelection[];
  style_selections?: StyleSelection[];
  accessory_selections?: AccessorySelection[];
  applied_fabric?: string;
  applied_fabric_yards?: number;
  note?: string;
}

// ──────────────── Shipment Types ────────────────

export type ShipmentType = 'vendor_to_customer' | 'fabric_transfer';

// Populated business reference on shipments
export interface ShipmentBusinessRef {
  _id: string;
  business_name: string;
  business_logo_url?: string;
}

// Populated fabric product reference on shipments
export interface ShipmentFabricProductRef {
  _id: string;
  fabric?: { name: string };
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
  rate_fetched_at?: string;
  shipped_at?: string;
  delivered_at?: string;
}

/** Extract the business ID from a shipment's business field (string or populated object) */
function extractBizId(biz: string | ShipmentBusinessRef | undefined): string | undefined {
  if (!biz) return undefined;
  return typeof biz === 'string' ? biz : biz._id;
}

/** Extract the business name from a populated shipment field, with fallback */
export function extractBizName(biz: string | ShipmentBusinessRef | undefined): string {
  if (!biz) return 'Vendor';
  return typeof biz === 'string' ? 'Vendor' : (biz.business_name || 'Vendor');
}

/** Extract fabric product name from populated field */
export function extractFabricName(fp: string | ShipmentFabricProductRef | undefined): string {
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
    firstName?: string;
    lastName?: string;
  };
  items: OrderItem[];
  address: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
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
  vendor_earnings?: number;
  platform_commission?: number;
  payout_eligible_at?: string;
  payout_status?: 'pending' | 'eligible' | 'paid';
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
export function getVendorItems(
  order: Order,
  businessId: string
): OrderItem[] {
  return order.items.filter((item) => {
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

/** Calculate the vendor-specific subtotal */
export function getVendorSubtotal(
  order: Order,
  businessId: string
): number {
  const items = getVendorItems(order, businessId);
  return items.reduce((sum, item) => {
    let itemTotal = 0;
    item.color_variant_selections?.forEach(
      (v) => (itemTotal += v.total_amount)
    );
    item.fabric_selections?.forEach((f) => (itemTotal += f.total_amount));
    item.style_selections?.forEach((s) => (itemTotal += s.total_amount));
    item.accessory_selections?.forEach(
      (a) => (itemTotal += a.total_amount)
    );
    return sum + itemTotal;
  }, 0);
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

    // GET /orders/chart — dashboard chart data (summary + all charts)
    getOrdersChart: builder.query<{ data: any }, void>({
      query: () => ({ url: '/orders/chart', method: 'GET' }),
      providesTags: ['OrderStats'],
    }),

    // GET /business/earnings-chart — earnings by day of week
    getEarningsChart: builder.query<{ data: any }, void>({
      query: () => ({ url: '/business/earnings-chart', method: 'GET' }),
      providesTags: ['OrderStats'],
    }),

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
  useGetOrdersChartQuery,
  useGetEarningsChartQuery,
  useGetVendorDashboardMetricsQuery,
} = ordersApiSlice;

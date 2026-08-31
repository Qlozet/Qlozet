// Orders API Slice
// RTK Query service for the admin Orders page.
//
// The only admin-facing orders endpoint on the backend is
// `GET /admin/vendor/orders` (Admin tag, `PlatformController_findVendorOrders`).
// Swagger documents a single optional `status` query param and does not describe
// the response body, so the response is unwrapped defensively below: the backend
// may return a bare array, an `{ data: [...] }` envelope, or a paginated
// `{ data: { data: [...] } }` envelope. Because no page/size params exist, the
// page paginates, searches and filters client-side over the full result set.

import { baseAPI } from '@/redux/api/base-api';
import { ApiResponse } from '../types';

export type AdminOrderStatus =
  | 'pending'
  | 'in_review'
  | 'processing'
  | 'in_transit'
  | 'completed'
  | 'cancelled'
  | 'returned';

export interface AdminOrderCustomer {
  _id?: string;
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  [key: string]: unknown;
}

/** Frozen itemised pricing snapshot taken at order time. `final` === total_price. */
export interface AdminOrderPricing {
  base?: number;
  styles_total?: number;
  fabric_total?: number;
  variant_total?: number;
  accessories_total?: number;
  addons_total?: number;
  before_discount?: number;
  discount?: number;
  final?: number;
}

/* ── Populated product sub-documents ──
 *
 * Verified against the live GET /admin/vendor/orders payload: `items[].product`
 * comes back fully populated, with the kind-specific sub-document (clothing /
 * fabric / accessory) carrying the catalogue arrays that the item's selection
 * arrays reference by id. Mirrors the vendor app's shape — the two endpoints
 * return the same item structure.
 */

export interface ProductImage {
  public_id?: string;
  url: string;
  width?: number;
  height?: number;
}

export interface ClothingStyleDoc {
  _id: string;
  name?: string;
  style_code?: string;
  type?: string;
  price?: number;
  images?: ProductImage[];
}

export interface ClothingFabricDoc {
  _id: string;
  name?: string;
  price_per_yard?: number;
  min_cut?: number;
  colors?: { name?: string; hex?: string }[];
  images?: ProductImage[];
}

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

/** Cross-vendor fabric applied to a custom outfit. */
export interface AppliedFabricRef {
  _id?: string;
  base_price?: number;
  fabric?: { name?: string; images?: ProductImage[] };
  business?:
    | string
    | { _id: string; business_name?: string; business_logo_url?: string };
}

export interface PopulatedProduct {
  _id?: string;
  name?: string;
  images?: (string | ProductImage)[];
  base_price?: number;
  kind?: 'clothing' | 'fabric' | 'accessory';
  clothing?: {
    name?: string;
    description?: string;
    type?: string;
    images?: ProductImage[];
    styles?: ClothingStyleDoc[];
    fabrics?: ClothingFabricDoc[];
    accessories?: ClothingAccessoryDoc[];
    addons?: ClothingAddonDoc[];
    color_variants?: ClothingColorVariantDoc[];
  };
  fabric?: { name?: string; images?: ProductImage[] };
  accessory?: { name?: string; images?: ProductImage[] };
}

/* ── Selections: what the customer actually chose ── */

export interface VariantSelection {
  variant_id?: string;
  color?: string;
  size?: string;
  price?: number;
  quantity?: number;
  total_amount?: number;
}

export interface FabricSelection {
  fabric_id?: string;
  yardage?: number;
  yards?: number;
  price?: number;
  quantity?: number;
  total_amount?: number;
}

export interface StyleSelection {
  style_id?: string;
  price?: number;
  quantity?: number;
  total_amount?: number;
}

export interface AccessorySelection {
  accessory_id?: string;
  variant_id?: string;
  price?: number;
  quantity?: number;
  total_amount?: number;
}

export interface AddonSelection {
  addon_id?: string;
  variant_id?: string;
  price?: number;
  quantity?: number;
  total_amount?: number;
}

export interface AdminOrderItem {
  quantity?: number;
  price?: number;
  total_price?: number;
  total_amount?: number;
  pricing?: AdminOrderPricing;
  /** Populated product document, or a bare ObjectId string. */
  product?: PopulatedProduct | string | unknown;
  /** Owning vendor's business id. */
  business?: string;
  color_variant_selections?: VariantSelection[];
  fabric_selections?: FabricSelection[];
  style_selections?: StyleSelection[];
  accessory_selections?: AccessorySelection[];
  addon_selections?: AddonSelection[];
  applied_fabric?: string | AppliedFabricRef | null;
  applied_fabric_yards?: number | null;
  note?: string;
  [key: string]: unknown;
}

export interface AdminOrder {
  _id: string;
  reference?: string;
  customer?: AdminOrderCustomer | string;
  items?: AdminOrderItem[];
  subtotal?: number;
  shipping_fee?: number;
  total?: number;
  status?: AdminOrderStatus | string;
  type?: string;
  // TODO(api): the Order schema is empty in Swagger, so payment/refund state is
  // undocumented. These are read defensively and render "—" when absent rather
  // than defaulting to "Paid" / "Not refunded".
  payment_status?: string;
  refund_status?: string;
  refunded?: boolean;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface GetAdminOrdersParams {
  status?: string;
  /**
   * 1-based. The backend DOES paginate — `/admin/vendor/orders` defaults to
   * page 1, size 10, sorted newest-first — so omitting these silently caps the
   * result at ten orders.
   */
  page?: number;
  size?: number;
  /** Narrow to one buyer's orders, for the admin customer detail page. */
  customerId?: string;
}

/**
 * Normalised result. `serverPaginated` reports whether the backend actually
 * honoured `page`/`size` — it echoes pagination metadata when it did. Until
 * then the caller keeps paginating client-side over the full list, so this
 * works before and after the endpoint is updated with no further changes.
 */
export interface AdminOrdersResult {
  data: AdminOrder[];
  serverPaginated: boolean;
  total_items?: number;
  total_pages?: number;
  current_page?: number;
  page_size?: number;
  has_next_page?: boolean;
}

export const ordersApiSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    // All vendor orders across the platform, optionally filtered by status.
    getAdminOrders: builder.query<
      AdminOrdersResult,
      GetAdminOrdersParams | void
    >({
      query: (params) => {
        const search = new URLSearchParams();
        if (params?.status) search.set('status', params.status);
        if (params?.customerId) search.set('customerId', params.customerId);
        if (params?.page) search.set('page', String(params.page));
        if (params?.size) search.set('size', String(params.size));
        const qs = search.toString();
        return {
          url: qs ? `/admin/vendor/orders?${qs}` : '/admin/vendor/orders',
          method: 'GET',
        };
      },
      // Normalise the undocumented response into a flat array plus whatever
      // pagination metadata came back.
      transformResponse: (response: unknown): AdminOrdersResult => {
        const unwrap = (value: unknown): AdminOrder[] => {
          if (Array.isArray(value)) return value as AdminOrder[];
          if (value && typeof value === 'object') {
            const inner = (value as { data?: unknown }).data;
            if (inner !== undefined) return unwrap(inner);
          }
          return [];
        };

        // The envelope may sit at the root or one level down under `data`.
        const root = (response ?? {}) as Record<string, unknown>;
        const nested = (root.data ?? {}) as Record<string, unknown>;
        const num = (key: string): number | undefined => {
          const v = root[key] ?? nested[key];
          return typeof v === 'number' ? v : undefined;
        };

        const total_items = num('total_items');
        const total_pages = num('total_pages');

        return {
          data: unwrap(response),
          // Metadata present == the backend paginated for us.
          serverPaginated:
            total_items !== undefined || total_pages !== undefined,
          total_items,
          total_pages,
          current_page: num('current_page'),
          page_size: num('page_size'),
          has_next_page:
            typeof (root.has_next_page ?? nested.has_next_page) === 'boolean'
              ? ((root.has_next_page ?? nested.has_next_page) as boolean)
              : undefined,
        };
      },
      providesTags: ['VendorOrders'],
    }),

    // GET /orders/:reference/measurements — the customer's measurement set for
    // THIS order. Order-time snapshot when present (snapshot: true, name = the
    // chosen set, e.g. "For Tolu"); live active set for legacy orders. Admin
    // reads it unscoped — useful when arbitrating measurement disputes.
    getOrderMeasurements: builder.query<OrderMeasurements | null, string>({
      query: (reference) => ({
        url: `/orders/${reference}/measurements`,
        method: 'GET',
      }),
      transformResponse: (res: unknown): OrderMeasurements | null => {
        let cur: any = res;
        for (let i = 0; i < 3; i++) {
          if (
            cur &&
            typeof cur === 'object' &&
            'data' in cur &&
            !('measurements' in cur)
          ) {
            cur = cur.data;
          } else break;
        }
        return cur && typeof cur === 'object' && 'measurements' in cur
          ? (cur as OrderMeasurements)
          : null;
      },
    }),
  }),
});

export interface OrderItemMeasurements {
  product_name?: string | null;
  set_name?: string | null;
  unit?: 'cm' | 'inch';
  snapshot?: boolean;
  measurements: Record<string, number>;
}

export interface OrderMeasurements {
  full_name?: string;
  /** Set name — the snapshot's chosen set (e.g. "For Tolu") or the live set. */
  name?: string;
  unit?: 'cm' | 'inch';
  active?: boolean;
  /** true → frozen at order time; absent/false → live profile (legacy order). */
  snapshot?: boolean;
  updatedAt?: string | null;
  measurements: Record<string, number>;
  /** Per-garment snapshots — one order can carry items for different bodies. */
  items?: OrderItemMeasurements[];
}

export const { useGetAdminOrdersQuery, useGetOrderMeasurementsQuery } =
  ordersApiSlice;

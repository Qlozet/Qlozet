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

export interface AdminOrderItem {
  quantity?: number;
  price?: number;
  total_price?: number;
  total_amount?: number;
  pricing?: AdminOrderPricing;
  product?: unknown;
  /** Per-selection arrays; only used here to total up quantities. */
  color_variant_selections?: { quantity?: number }[];
  fabric_selections?: { quantity?: number }[];
  style_selections?: { quantity?: number }[];
  accessory_selections?: { quantity?: number }[];
  addon_selections?: { quantity?: number }[];
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
  /** Optional order status filter — the only param the endpoint accepts. */
  status?: string;
}

export const ordersApiSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    // All vendor orders across the platform, optionally filtered by status.
    getAdminOrders: builder.query<
      ApiResponse<AdminOrder[]>,
      GetAdminOrdersParams | void
    >({
      query: (params) => {
        const status = params && 'status' in params ? params.status : undefined;
        return {
          url: status
            ? `/admin/vendor/orders?status=${encodeURIComponent(status)}`
            : '/admin/vendor/orders',
          method: 'GET',
        };
      },
      // Normalise the undocumented response into a flat array of orders.
      transformResponse: (response: unknown): ApiResponse<AdminOrder[]> => {
        const unwrap = (value: unknown): AdminOrder[] => {
          if (Array.isArray(value)) return value as AdminOrder[];
          if (value && typeof value === 'object') {
            const inner = (value as { data?: unknown }).data;
            if (inner !== undefined) return unwrap(inner);
          }
          return [];
        };

        const envelope = (response ?? {}) as {
          success?: boolean;
          message?: string;
        };

        return {
          success: envelope.success,
          message: envelope.message,
          data: unwrap(response),
        };
      },
      providesTags: ['VendorOrders'],
    }),
  }),
});

export const { useGetAdminOrdersQuery } = ordersApiSlice;

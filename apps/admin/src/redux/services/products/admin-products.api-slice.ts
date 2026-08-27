// Admin Products API Slice
//
// GET /products is the *customer storefront*: it hard-codes status=active and
// hides unapproved vendors, so a moderator reading it sees a catalogue with no
// drafts, nothing archived and nothing to moderate — every row came back
// "Active" because nothing else could. These endpoints hit the admin surface
// (/admin/products), which reads the collection unfiltered.

import { baseAPI } from '@/redux/api/base-api';
import { ApiResponse, PaginatedData, buildQueryString } from '../types';
import type { Product } from './products.api-slice';
import type { ReviewsSummary } from '@/pattern/common/organisms/reviews-drawer';
import type { VendorNote } from '../vendor-details/vendor-details.api-slice';

export type ProductStatus = 'active' | 'draft' | 'archived' | 'scheduled';
export type ProductModerationStatus = 'pending' | 'approved' | 'rejected';

export interface AdminProductsParams {
  page?: number;
  size?: number;
  kind?: string;
  search?: string;
  business_id?: string;
  status?: ProductStatus;
  moderation_status?: ProductModerationStatus;
  product_type?: string;
  category?: string;
  audience?: string;
  type?: string;
  tag?: string;
  minPrice?: number;
  maxPrice?: number;
  on_sale?: boolean;
  in_stock?: boolean;
  from?: string;
  to?: string;
  sortBy?: 'date' | 'price' | 'name' | 'rating' | 'stock';
  order?: 'asc' | 'desc';
}

export interface AdminProductStats {
  total_products: number;
  active_products: number;
  draft_products: number;
  archived_products: number;
  scheduled_products: number;
  pending_products: number;
  approved_products: number;
  rejected_products: number;
  /**
   * Movement over the last `period_days`, in the same shape the vendors and
   * orders summaries use. A member is null when the previous window was empty —
   * there is no meaningful percentage — and `formatChange` renders no badge.
   */
  changes?: {
    period_days: number;
    total_products: number | null;
    archived_products: number | null;
  };
  sales_by_category: { name: string; value: number }[];
}

export interface AdminProductFilterOptions {
  product_types: string[];
  categories: string[];
  audiences: string[];
  tags: { name: string; slug: string }[];
  vendors: { id: string; name: string; count: number }[];
  statuses: ProductStatus[];
  moderation_statuses: ProductModerationStatus[];
}

/** One review left on a product — the reviewer, not the product, identifies it. */
export interface ProductReview {
  rating: number;
  comment?: string | null;
  reviewer?: { _id?: string; name?: string; email?: string };
  created_at?: string | null;
}

export interface ProductReviewsPage {
  summary: ReviewsSummary;
  reviews: ProductReview[];
  pagination: { page: number; size: number; total: number; pages: number };
}

const toQuery = (params: AdminProductsParams = {}) =>
  buildQueryString(
    Object.fromEntries(
      Object.entries(params).map(([key, value]) => [
        key,
        typeof value === 'boolean' ? String(value) : value,
      ])
    ) as Record<string, string | number | undefined>
  );

export const adminProductsApiSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    // GET /admin/products — the catalogue in every status, from every vendor
    getAdminProducts: builder.query<
      ApiResponse<PaginatedData<Product>>,
      AdminProductsParams | void
    >({
      query: (params) => ({
        url: `/admin/products${toQuery(params ?? {})}`,
        method: 'GET',
      }),
      providesTags: ['Products'],
    }),

    // GET /admin/products/{id} — one product in any status, for the detail page
    getAdminProduct: builder.query<ApiResponse<Product>, string>({
      query: (id) => ({ url: `/admin/products/${id}`, method: 'GET' }),
      providesTags: ['Product'],
    }),

    // GET /admin/products/stats — header cards + the sales-by-category donut
    getAdminProductStats: builder.query<
      ApiResponse<AdminProductStats>,
      AdminProductsParams | void
    >({
      query: (params) => ({
        url: `/admin/products/stats${toQuery(params ?? {})}`,
        method: 'GET',
      }),
      providesTags: ['ProductStats'],
    }),

    // GET /admin/products/filters — filter values actually present in the data
    getAdminProductFilters: builder.query<
      ApiResponse<AdminProductFilterOptions>,
      { kind?: string } | void
    >({
      query: (params) => ({
        url: `/admin/products/filters${buildQueryString({ kind: params?.kind })}`,
        method: 'GET',
      }),
      providesTags: ['ProductFilters'],
    }),

    // GET /admin/products/{id}/reviews — the reviews drawer on the detail page
    getAdminProductReviews: builder.query<
      ApiResponse<ProductReviewsPage>,
      { productId: string; page?: number; size?: number; sortBy?: string }
    >({
      query: ({ productId, ...params }) => ({
        url: `/admin/products/${productId}/reviews${buildQueryString(params)}`,
        method: 'GET',
      }),
      providesTags: ['ProductReviews'],
    }),

    // Internal notes and flags on ONE product. Never shown to the vendor.
    //
    // Served by the same collection and service as vendor notes — a product
    // note has the same author, body, kind and resolution, so clearing and
    // deleting go through the existing /admin/vendor-notes/{id} routes.
    getProductNotes: builder.query<
      ApiResponse<PaginatedData<VendorNote>>,
      { productId: string; page?: number; size?: number }
    >({
      query: ({ productId, ...params }) => ({
        url: `/admin/products/${productId}/notes${buildQueryString(params)}`,
        method: 'GET',
      }),
      providesTags: ['ProductNotes'],
    }),

    addProductNote: builder.mutation<
      ApiResponse<VendorNote>,
      { productId: string; body: string; kind?: 'note' | 'flag' }
    >({
      query: ({ productId, ...payload }) => ({
        url: `/admin/products/${productId}/notes`,
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['ProductNotes'],
    }),

    // POST /admin/products/{id}/escalate — raises a support ticket against the
    // product's vendor, naming the listing.
    escalateProduct: builder.mutation<
      ApiResponse<{ _id?: string }>,
      { productId: string; issue_type: string; description: string }
    >({
      query: ({ productId, ...payload }) => ({
        url: `/admin/products/${productId}/escalate`,
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['Tickets'],
    }),

    // PATCH /admin/products/{id} — partial edit from the product form
    updateAdminProduct: builder.mutation<
      ApiResponse<Product>,
      { id: string } & Record<string, unknown>
    >({
      query: ({ id, ...body }) => ({
        url: `/admin/products/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [
        'Product',
        'Products',
        'ProductStats',
        'ProductFilters',
      ],
    }),

    // PATCH /admin/products/{id}/status — Activate / Deactivate / Archive
    updateAdminProductStatus: builder.mutation<
      ApiResponse<Product>,
      { id: string; status: ProductStatus; reason?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/admin/products/${id}/status`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Product', 'Products', 'ProductStats'],
    }),

    // PATCH /admin/products/{id}/schedule-activation
    scheduleAdminProductActivation: builder.mutation<
      ApiResponse<unknown>,
      { id: string; activation_date: string }
    >({
      query: ({ id, activation_date }) => ({
        url: `/admin/products/${id}/schedule-activation`,
        method: 'PATCH',
        body: { activation_date },
      }),
      invalidatesTags: ['Product', 'Products', 'ProductStats'],
    }),

    // POST /admin/products/{id}/approve
    approveAdminProduct: builder.mutation<
      ApiResponse<Product>,
      { id: string; reason?: string }
    >({
      query: ({ id, reason }) => ({
        url: `/admin/products/${id}/approve`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: ['Product', 'Products', 'ProductStats'],
    }),

    // POST /admin/products/{id}/reject — flags the listing, deletes nothing
    rejectAdminProduct: builder.mutation<
      ApiResponse<Product>,
      { id: string; reason: string }
    >({
      query: ({ id, reason }) => ({
        url: `/admin/products/${id}/reject`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: ['Product', 'Products', 'ProductStats'],
    }),
  }),
});

export const {
  useGetAdminProductsQuery,
  useGetAdminProductQuery,
  useGetAdminProductStatsQuery,
  useGetAdminProductFiltersQuery,
  useGetAdminProductReviewsQuery,
  useGetProductNotesQuery,
  useAddProductNoteMutation,
  useEscalateProductMutation,
  useUpdateAdminProductMutation,
  useUpdateAdminProductStatusMutation,
  useScheduleAdminProductActivationMutation,
  useApproveAdminProductMutation,
  useRejectAdminProductMutation,
} = adminProductsApiSlice;

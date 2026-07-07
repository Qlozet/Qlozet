// Discounts API Slice
// RTK Query service for the Qlozet Discounts domain.

import { baseAPI } from '@/redux/api/base-api';
import { ApiResponse } from '../types';

// ─── Types ───────────────────────────────────────────────────────────

export interface DiscountCondition {
  field: string;
  operator: string;
  value: string;
}

export type DiscountType =
  | 'fixed'
  | 'percentage'
  | 'store_wide'
  | 'flash_fixed'
  | 'flash_percentage'
  | 'category_specific';

export interface Discount {
  _id: string;
  title?: string;
  type?: DiscountType;
  value?: number;
  value_type?: 'fixed' | 'percentage';
  required_discount?: boolean;
  condition_match?: 'all' | 'any';
  conditions?: DiscountCondition[];
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
  manual_includes?: string[];
  manual_excludes?: string[];
  business?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface CreateDiscountRequest {
  title: string;
  type: DiscountType;
  value: number;
  value_type?: 'fixed' | 'percentage';
  required_discount: boolean;
  condition_match: 'all' | 'any';
  conditions: DiscountCondition[];
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  manual_includes?: string[];
  manual_excludes?: string[];
}

export type UpdateDiscountRequest = Partial<CreateDiscountRequest>;

export interface DiscountedProduct {
  _id: string;
  [key: string]: unknown;
}

// ─── API Slice ───────────────────────────────────────────────────────

export const discountsApiSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    // GET /discounts — all discounts (paginated)
    getDiscounts: builder.query<
      ApiResponse<{ data: Discount[]; total?: number }>,
      { page?: number; size?: number } | void
    >({
      query: (params) => {
        const p = params ?? {};
        const searchParams = new URLSearchParams();
        if (p.page) searchParams.set('page', String(p.page));
        if (p.size) searchParams.set('size', String(p.size));
        const qs = searchParams.toString();
        return { url: `/discounts${qs ? `?${qs}` : ''}`, method: 'GET' };
      },
      providesTags: ['Discounts'],
    }),

    // GET /discounts/active — active discounts only
    getActiveDiscounts: builder.query<ApiResponse<Discount[]>, void>({
      query: () => ({ url: '/discounts/active', method: 'GET' }),
      providesTags: ['Discounts'],
    }),

    // GET /discounts/:id — single discount
    getDiscount: builder.query<ApiResponse<Discount>, string>({
      query: (id) => ({ url: `/discounts/${id}`, method: 'GET' }),
      providesTags: (_r, _e, id) => [{ type: 'Discount', id }],
    }),

    // POST /discounts — create a discount
    createDiscount: builder.mutation<ApiResponse<Discount>, CreateDiscountRequest>({
      query: (body) => ({ url: '/discounts', method: 'POST', body }),
      invalidatesTags: ['Discounts'],
    }),

    // PATCH /discounts/:id — update a discount
    updateDiscount: builder.mutation<
      ApiResponse<Discount>,
      { id: string } & UpdateDiscountRequest
    >({
      query: ({ id, ...body }) => ({
        url: `/discounts/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        'Discounts',
        { type: 'Discount', id },
      ],
    }),

    // DELETE /discounts/:id — delete a discount
    deleteDiscount: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({ url: `/discounts/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Discounts'],
    }),

    // POST /discounts/:discountId/include/:productId
    includeProduct: builder.mutation<
      ApiResponse<Discount>,
      { discountId: string; productId: string }
    >({
      query: ({ discountId, productId }) => ({
        url: `/discounts/${discountId}/include/${productId}`,
        method: 'POST',
      }),
      invalidatesTags: ['Discounts'],
    }),

    // POST /discounts/:discountId/exclude/:productId
    excludeProduct: builder.mutation<
      ApiResponse<Discount>,
      { discountId: string; productId: string }
    >({
      query: ({ discountId, productId }) => ({
        url: `/discounts/${discountId}/exclude/${productId}`,
        method: 'POST',
      }),
      invalidatesTags: ['Discounts'],
    }),

    // POST /discounts/apply/:id — manually trigger re-application
    applyDiscount: builder.mutation<ApiResponse<DiscountedProduct[]>, string>({
      query: (id) => ({ url: `/discounts/apply/${id}`, method: 'POST' }),
      invalidatesTags: ['Discounts'],
    }),

    // GET /discounts/discounted-products
    getDiscountedProducts: builder.query<ApiResponse<DiscountedProduct[]>, void>({
      query: () => ({ url: '/discounts/discounted-products', method: 'GET' }),
      providesTags: ['Discounts'],
    }),

    // GET /discounts/vendor/products
    getVendorDiscountedProducts: builder.query<
      ApiResponse<DiscountedProduct[]>,
      { page?: number; size?: number; kind?: string } | void
    >({
      query: (params) => {
        const p = params ?? {};
        const searchParams = new URLSearchParams();
        if (p.page) searchParams.set('page', String(p.page));
        if (p.size) searchParams.set('size', String(p.size));
        if (p.kind) searchParams.set('kind', p.kind);
        const qs = searchParams.toString();
        return { url: `/discounts/vendor/products${qs ? `?${qs}` : ''}`, method: 'GET' };
      },
      providesTags: ['Discounts'],
    }),
  }),
});

// ─── Hooks ───────────────────────────────────────────────────────────

export const {
  useGetDiscountsQuery,
  useGetActiveDiscountsQuery,
  useGetDiscountQuery,
  useCreateDiscountMutation,
  useUpdateDiscountMutation,
  useDeleteDiscountMutation,
  useIncludeProductMutation,
  useExcludeProductMutation,
  useApplyDiscountMutation,
  useGetDiscountedProductsQuery,
  useGetVendorDiscountedProductsQuery,
} = discountsApiSlice;

// Discounts API Slice
// RTK Query service for the Qlozet "Discounts" tag.

import { baseAPI } from '@/redux/api/base-api';
import { ApiResponse } from '../types';

// DiscountConditionDto
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

// CreateDiscountDto
export interface CreateDiscountRequest {
  type: DiscountType;
  value: number;
  value_type?: 'fixed' | 'percentage';
  required_discount: boolean;
  condition_match: 'all' | 'any';
  conditions: DiscountCondition[];
  start_date?: string;
  end_date?: string;
  is_active: boolean;
}

export interface Discount {
  _id: string;
  type?: DiscountType;
  value?: number;
  value_type?: 'fixed' | 'percentage';
  required_discount?: boolean;
  condition_match?: 'all' | 'any';
  conditions?: DiscountCondition[];
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface DiscountedProduct {
  _id: string;
  [key: string]: unknown;
}

// ---- API Slice ----
export const discountsApiSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    // GET /discounts — all discounts
    getDiscounts: builder.query<ApiResponse<Discount[]>, void>({
      query: () => ({ url: '/discounts', method: 'GET' }),
      providesTags: ['Discounts'],
    }),

    // GET /discounts/active — active discounts only
    getActiveDiscounts: builder.query<ApiResponse<Discount[]>, void>({
      query: () => ({ url: '/discounts/active', method: 'GET' }),
      providesTags: ['Discounts'],
    }),

    // GET /discounts/discounted-products — all discounted products
    getDiscountedProducts: builder.query<ApiResponse<DiscountedProduct[]>, void>({
      query: () => ({ url: '/discounts/discounted-products', method: 'GET' }),
      providesTags: ['Discounts'],
    }),

    // GET /discounts/vendor/products — discounted products for the vendor
    getVendorDiscountedProducts: builder.query<
      ApiResponse<DiscountedProduct[]>,
      void
    >({
      query: () => ({ url: '/discounts/vendor/products', method: 'GET' }),
      providesTags: ['Discounts'],
    }),

    // POST /discounts — create a discount
    createDiscount: builder.mutation<ApiResponse<Discount>, CreateDiscountRequest>({
      query: (body) => ({ url: '/discounts', method: 'POST', body }),
      invalidatesTags: ['Discounts'],
    }),

    // GET /discounts/apply/{id} — manually apply a discount to matching products
    applyDiscount: builder.mutation<ApiResponse<DiscountedProduct[]>, string>({
      query: (id) => ({ url: `/discounts/apply/${id}`, method: 'GET' }),
      invalidatesTags: ['Discounts'],
    }),
  }),
});

// ---- Hooks ----
export const {
  useGetDiscountsQuery,
  useGetActiveDiscountsQuery,
  useGetDiscountedProductsQuery,
  useGetVendorDiscountedProductsQuery,
  useCreateDiscountMutation,
  useApplyDiscountMutation,
} = discountsApiSlice;

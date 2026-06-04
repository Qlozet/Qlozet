// Products API Slice
// RTK Query service for admin read access to the product catalogue
// (e.g. inspecting a vendor's products from the admin panel).

import { baseAPI } from '@/redux/api/base-api';
import { ApiResponse, PaginatedData, buildQueryString } from '../types';

export interface Product {
  _id: string;
  name?: string;
  description?: string;
  kind?: string;
  status?: string;
  price?: number;
  business_id?: string;
  images?: { url: string; public_id?: string }[];
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface GetProductsParams {
  business_id?: string;
  page?: number;
  size?: number;
  kind?: string;
  search?: string;
  status?: string;
  sortBy?: string;
  order?: string;
}

// API Slice
export const productsApiSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    // GET /products — all products with pagination/filters (optionally per vendor)
    getProducts: builder.query<
      ApiResponse<PaginatedData<Product>>,
      GetProductsParams | void
    >({
      query: (params) => ({
        url: `/products${buildQueryString({ ...(params ?? {}) })}`,
        method: 'GET',
      }),
      providesTags: ['Products'],
    }),

    // GET /products/{id} — single product
    getProduct: builder.query<ApiResponse<Product>, string>({
      query: (id) => ({ url: `/products/${id}`, method: 'GET' }),
      providesTags: ['Product'],
    }),

    // GET /products/{id}/ratings — rating summary and reviews
    getProductRatings: builder.query<ApiResponse<unknown>, string>({
      query: (id) => ({ url: `/products/${id}/ratings`, method: 'GET' }),
      providesTags: ['Product'],
    }),

    // DELETE /products/{id} — remove a product (admin moderation)
    deleteProduct: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({ url: `/products/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Product', 'Products'],
    }),
  }),
});

// Export hooks
export const {
  useGetProductsQuery,
  useGetProductQuery,
  useGetProductRatingsQuery,
  useDeleteProductMutation,
} = productsApiSlice;

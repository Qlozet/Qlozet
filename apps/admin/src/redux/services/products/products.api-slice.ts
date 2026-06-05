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

export interface ProductImageDto {
  url: string;
  public_id?: string;
}

// Mirrors the vendor app's FabricDto so the admin "Add Fabric" form posts the
// same shape the backend already accepts (POST /products/fabric).
export interface FabricDto {
  name: string;
  description?: string;
  material?: string;
  colour?: string;
  pattern?: string;
  sub_category?: string;
  category?: string;
  yard_length: number;
  width: number;
  min_cut: number;
  price_per_yard: number;
  images?: ProductImageDto[];
}

export interface CreateFabricRequest {
  product_id?: string;
  fabric: FabricDto;
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

    // POST /products/fabric — create a fabric product from the admin panel
    createFabric: builder.mutation<ApiResponse<unknown>, CreateFabricRequest>({
      query: (body) => ({
        url: `/products/fabric`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Products'],
    }),
  }),
});

// Export hooks
export const {
  useGetProductsQuery,
  useGetProductQuery,
  useGetProductRatingsQuery,
  useDeleteProductMutation,
  useCreateFabricMutation,
} = productsApiSlice;

// Products API Slice
// RTK Query service for admin read access to the product catalogue
// (e.g. inspecting a vendor's products from the admin panel).

import { baseAPI } from '@/redux/api/base-api';
import { ApiResponse, PaginatedData, buildQueryString } from '../types';

/**
 * A catalogue product as the API returns it.
 *
 * The document is discriminated on `kind`: the sellable detail (name, images,
 * taxonomy, variants) lives under `clothing` / `accessory` / `fabric`, and only
 * the envelope is top-level. Read fields through the helpers in `@/lib/products`
 * rather than reaching in directly — the nesting differs per kind.
 */
export interface Product {
  _id: string;
  kind?: string;
  status?: string;
  seo?: { title?: string; keywords?: string[] };
  metafields?: Record<string, unknown>;
  base_price?: number;
  discounted_price?: number | null;
  discount_percentage?: number | null;
  scheduled_activation_date?: string | null;
  moderation?: {
    status?: 'pending' | 'approved' | 'rejected';
    reason?: string | null;
    moderated_at?: string | null;
  };
  clothing?: Record<string, unknown> | null;
  accessory?: Record<string, unknown> | null;
  fabric?: Record<string, unknown> | null;
  business?: { _id?: string; business_name?: string } | string;
  tags?: { name?: string; slug?: string }[];
  availability?: Record<string, unknown>;
  average_rating?: number;
  createdAt?: string;
  updatedAt?: string;
  // Legacy flat fields some older screens still read.
  name?: string;
  description?: string;
  price?: number;
  business_id?: string;
  images?: { url: string; public_id?: string }[];
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
  variants?: VariantDto[];
}

export interface CreateFabricRequest {
  product_id?: string;
  fabric: FabricDto;
}

// Mirrors the vendor app's accessory shape (POST /products/accessory).
export interface TaxonomyDto {
  product_type: string;
  categories: string[];
  attributes: string[];
  audience: string;
}

export interface VariantDto {
  size?: string;
  stock: number;
  price: number;
  sku?: string;
  yard_per_order?: number;
  color?: { name: string; hex: string };
  images?: ProductImageDto[];
}

// A colour (or fabric) grouping with its own images and per-size variants.
// Mirrors the vendor ClothingDto contract (POST /products/clothing).
export interface ColorVariantDto {
  name: string;
  hex: string;
  images: ProductImageDto[];
  variants: VariantDto[];
}

export interface ClothingDto {
  name: string;
  type: 'customize' | 'non_customize';
  description?: string;
  turnaround_days: number;
  taxonomy: TaxonomyDto;
  status: 'active' | 'draft' | 'archived';
  images?: ProductImageDto[];
  styles?: unknown[];
  accessories?: unknown[];
  fabrics?: unknown[];
  color_variants: ColorVariantDto[];
}

export interface CreateClothingRequest {
  seo?: { title?: string; keywords?: string[] };
  metafields?: Record<string, unknown>;
  clothing: ClothingDto;
}

export interface AccessoryDto {
  name: string;
  description?: string;
  price: number;
  sub_category?: string;
  taxonomy: TaxonomyDto;
  variants: VariantDto[];
  images?: ProductImageDto[];
}

export interface CreateAccessoryRequest {
  product_id?: string;
  accessory: AccessoryDto;
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
      // ProductStats too: the header cards count the catalogue, so a delete
      // that didn't invalidate them left "Total products" one too high.
      invalidatesTags: ['Product', 'Products', 'ProductStats'],
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

    // POST /products/accessory — create an accessory product from the admin panel
    createAccessory: builder.mutation<
      ApiResponse<unknown>,
      CreateAccessoryRequest
    >({
      query: (body) => ({
        url: `/products/accessory`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Products'],
    }),

    // POST /products/clothing — create a clothing product from the admin panel
    createClothing: builder.mutation<
      ApiResponse<unknown>,
      CreateClothingRequest
    >({
      query: (body) => ({
        url: `/products/clothing`,
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
  useCreateAccessoryMutation,
  useCreateClothingMutation,
} = productsApiSlice;

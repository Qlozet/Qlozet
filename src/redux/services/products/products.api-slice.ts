import { baseAPI } from '../../api/base-api';

// Types for products
export interface Product {
  _id?: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  stock: number;
  status: 'active' | 'draft' | 'inactive';
  images: string[];
  variants?: ProductVariant[];
  customizations?: ProductCustomization[];
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductVariant {
  id?: string;
  size?: string;
  color?: string;
  material?: string;
  additionalPrice: number;
  stock?: number;
}

export interface ProductCustomization {
  id?: string;
  name: string;
  options: string[];
  additionalPrice: number;
}

// Clothing-specific types
export interface TaxonomyDto {
  product_type: string;
  categories: string[];
  attributes: string[];
  audience: string;
}

export interface StyleHotspotDto {
  field_key: string;
  label?: string;
  x: number;
  y: number;
  anchor?: 'center' | 'top-left';
  radius?: number;
  zIndex?: number;
}

export interface ProductImageDto {
  public_id: string;
  url: string;
  width?: number;
  height?: number;
  hotspots?: StyleHotspotDto[];
}

export interface CreateStyleDto {
  name: string;
  style_code: string;
  categories: string[];
  images: ProductImageDto[];
  attributes: string[];
  price: number;
  min_width_cm: number;
  notes?: string;
  type: string;
}

export interface VariantDto {
  size?: string;
  stock: number;
  price: number;
  sku?: string;
  yard_per_order?: number;
  color?: {
    name: string;
    hex: string;
  };
}

export interface ColorVariantDto {
  name: string;
  hex: string;
  images: ProductImageDto[];
  variants: VariantDto[];
}

export interface AccessoryDto {
  name: string;
  description?: string;
  price: number;
  taxonomy: TaxonomyDto;
  variants: VariantDto[];
  images: ProductImageDto[];
}

export interface FabricDto {
  name: string;
  description?: string;
  product_type: string;
  pattern?: string;
  yard_length: number;
  width: number;
  min_cut: number;
  price_per_yard: number;
  images?: ProductImageDto[];
  variants?: VariantDto[];
}

export interface ClothingDto {
  name: string;
  type: 'customize' | 'non_customize';
  description?: string;
  turnaround_days: number;
  taxonomy: TaxonomyDto;
  status: 'active' | 'draft' | 'archived';
  images?: ProductImageDto[];
  styles?: CreateStyleDto[];
  accessories?: AccessoryDto[];
  color_variants: ColorVariantDto[];
  fabrics?: FabricDto[];
}

export interface CreateClothingDto {
  seo?: {
    title?: string;
    keywords?: string[];
  };
  metafields?: Record<string, any>;
  clothing: ClothingDto;
}

export interface CreateClothingResponse {
  statusCode: number;
  message: string;
  data?: any;
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
  parentId?: string;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  category: string;
  price: number;
  stock: number;
  status: 'active' | 'draft' | 'inactive' | 'scheduled';
  images: string[];
  variants?: Omit<ProductVariant, 'id'>[];
  customizations?: Omit<ProductCustomization, 'id'>[];
  tags?: string[];
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  _id: string;
}

export interface ProductsResponse {
  statusCode?: number;
  message?: string;
  error?: any;
  timestamp?: number;
  version?: string;
  path?: string;
  data?: {
    total_items?: number;
    data?: Product[];
    total_pages?: number;
    current_page?: number;
    has_next_page?: boolean;
    has_previous_page?: boolean;
    page_size?: number;
  };
  // Legacy support for other API response formats
  products?: Product[];
  total?: number;
  totalCount?: number;
  page?: number;
  currentPage?: number;
  limit?: number;
  pageSize?: number;
  totalPages?: number;
  success?: boolean;
}

export interface ProductsFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'name' | 'price' | 'createdAt' | 'stock';
  sortOrder?: 'asc' | 'desc';
}

// API slice
export const productsApiSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    // Get all products with filters
    getProducts: builder.query<ProductsResponse, ProductsFilters>({
      query: (filters = {}) => {
        const searchParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            searchParams.append(key, String(value));
          }
        });
        return {
          url: `/products?${searchParams.toString()}`,
          method: 'GET',
        };
      },
      providesTags: ['Products'],
    }),

    // Get single product by ID
    getProduct: builder.query<Product, string>({
      query: (id) => ({
        url: `/products/${id}`,
        method: 'GET',
      }),
      providesTags: ['Product', 'Products'],
    }),

    // Create new product
    createProduct: builder.mutation<Product, CreateProductRequest>({
      query: (productData) => ({
        url: '/products',
        method: 'POST',
        body: productData,
      }),
      invalidatesTags: ['Products'],
    }),

    // Update existing product
    updateProduct: builder.mutation<Product, UpdateProductRequest>({
      query: ({ _id, ...productData }) => ({
        url: `/products/${_id}`,
        method: 'PUT',
        body: productData,
      }),
      invalidatesTags: ['Product', 'Products'],
    }),

    // Delete product
    deleteProduct: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (id) => ({
        url: `/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product', 'Products'],
    }),

    // Get categories
    getCategories: builder.query<Category[], void>({
      query: () => ({
        url: '/categories',
        method: 'GET',
      }),
      providesTags: ['Category'],
    }),

    // Upload product images
    uploadProductImages: builder.mutation<{ urls: string[] }, FormData>({
      query: (formData) => ({
        url: '/upload/products',
        method: 'POST',
        body: formData,
      }),
    }),

    // Bulk update product status
    bulkUpdateProductStatus: builder.mutation<
      { success: boolean; updatedCount: number },
      { productIds: string[]; status: 'active' | 'draft' | 'inactive' }
    >({
      query: ({ productIds, status }) => ({
        url: '/products/bulk-status',
        method: 'PATCH',
        body: { productIds, status },
      }),
      invalidatesTags: ['Product'],
    }),

    // Get product analytics/stats
    getProductStats: builder.query<
      {
        totalProducts: number;
        activeProducts: number;
        draftProducts: number;
        inactiveProducts: number;
        lowStockProducts: number;
      },
      void
    >({
      query: () => ({
        url: '/products/stats',
        method: 'GET',
      }),
    }),

    // Get all vendor products (for axios migration)
    getAllVendorProducts: builder.query<any, void>({
      query: () => ({
        url: '/vendor/products/all',
        method: 'GET',
      }),
      providesTags: ['Products'],
    }),

    // Create accessory product (for axios migration)
    createAccessory: builder.mutation<any, any>({
      query: (data) => ({
        url: '/vendor/products/accessory',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Products'],
    }),

    // Toggle product status (for axios migration)
    toggleProductStatus: builder.mutation<any, string>({
      query: (productId) => ({
        url: `/vendor/products/${productId}/toggle`,
        method: 'PUT',
      }),
      invalidatesTags: ['Products', 'Product'],
    }),

    // Delete vendor product (for axios migration)
    deleteVendorProduct: builder.mutation<any, string>({
      query: (productId) => ({
        url: `/vendor/products/${productId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Products', 'Product'],
    }),

    // Upload single image (for axios migration)
    uploadSingleImage: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: '/vendor/products/single-image',
        method: 'POST',
        body: formData,
      }),
    }),

    // Schedule product (for axios migration)
    scheduleProduct: builder.mutation<
      any,
      { productId: string; date: string; time: string }
    >({
      query: ({ productId, date, time }) => ({
        url: `/vendor/schedule/products?productId=${productId}&date=${date}&time=${time}`,
        method: 'POST',
      }),
      invalidatesTags: ['Products', 'Product'],
    }),

    // Review item (for axios migration)
    reviewItem: builder.mutation<any, { itemId: string; review: any }>({
      query: ({ itemId, review }) => ({
        url: `/vendor/products/review/${itemId}`,
        method: 'PUT',
        body: review,
      }),
      invalidatesTags: ['Products', 'Product'],
    }),

    // Create clothing product
    createClothing: builder.mutation<CreateClothingResponse, CreateClothingDto>({
      query: (clothingData) => ({
        url: '/products/clothing',
        method: 'POST',
        body: clothingData,
      }),
      invalidatesTags: ['Products'],
    }),
  }),
});

// Export hooks
export const {
  useGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetCategoriesQuery,
  useUploadProductImagesMutation,
  useBulkUpdateProductStatusMutation,
  useGetProductStatsQuery,
  useLazyGetProductsQuery,
  useLazyGetProductQuery,
  useGetAllVendorProductsQuery,
  useCreateAccessoryMutation,
  useToggleProductStatusMutation,
  useDeleteVendorProductMutation,
  useUploadSingleImageMutation,
  useScheduleProductMutation,
  useReviewItemMutation,
  useCreateClothingMutation,
} = productsApiSlice;

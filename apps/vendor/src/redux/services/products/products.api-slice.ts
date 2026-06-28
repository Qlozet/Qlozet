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

// CreateFabricDto — wrapper around FabricDto for POST /products/fabric
export interface CreateFabricRequest {
  product_id?: string;
  seo?: {
    title?: string;
    keywords?: string[];
  };
  metafields?: Record<string, any>;
  fabric: FabricDto;
}

// CreateAccessoryDto — wrapper around AccessoryDto for POST /products/accessory
export interface CreateAccessoryRequest {
  product_id?: string;
  seo?: {
    title?: string;
    keywords?: string[];
  };
  metafields?: Record<string, any>;
  accessory: AccessoryDto;
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
  size?: number; // API uses 'size' instead of 'limit'
  search?: string;
  kind?: 'clothing' | 'accessory' | 'fabric'; // API uses 'kind' instead of 'category'
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'name' | 'price' | 'createdAt' | 'stock';
  order?: 'asc' | 'desc'; // API uses 'order' instead of 'sortOrder'
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

    // Create accessory product (backend: POST /products/accessory)
    createAccessory: builder.mutation<any, any>({
      query: (data) => ({
        url: '/products/accessory',
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

    // ---- Reconciled Qlozet "Products" endpoints ----

    // POST /products/fabric — create a fabric product
    createFabric: builder.mutation<CreateClothingResponse, CreateFabricRequest>({
      query: (fabricData) => ({
        url: '/products/fabric',
        method: 'POST',
        body: fabricData,
      }),
      invalidatesTags: ['Products'],
    }),

    // GET /products/by-vendor — products owned by the current vendor
    getProductsByVendor: builder.query<
      ProductsResponse,
      ProductsFilters | void
    >({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        Object.entries(params ?? {}).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            searchParams.append(key, String(value));
          }
        });
        const qs = searchParams.toString();
        return { url: `/products/by-vendor${qs ? `?${qs}` : ''}`, method: 'GET' };
      },
      transformResponse: (response: any) => {
        if (response?.data?.data) {
          response.data.data = response.data.data.map((item: any) => {
            const inner = item[item.kind];
            if (inner) {
              let variants: any[] = [];
              if (item.kind === 'clothing' && inner.color_variants) {
                variants = inner.color_variants.flatMap((cv: any) => 
                  (cv.variants || []).map((v: any) => ({
                    _id: v._id,
                    size: v.size,
                    color: cv.name,
                    additionalPrice: v.price || 0,
                    stock: v.stock || 0
                  }))
                );
              } else if (inner.variants) {
                variants = inner.variants.map((v: any) => ({
                  _id: v._id,
                  size: v.size,
                  color: v.color?.name,
                  additionalPrice: v.price || 0,
                  stock: v.stock || 0
                }));
              }

              const stock = variants.reduce((acc, v) => acc + (v.stock || 0), 0);

              return {
                ...item,
                name: inner.name || '',
                description: inner.description || '',
                price: item.base_price || item.metafields?.base_price || 0,
                stock: stock,
                status: item.status,
                category: inner.taxonomy?.categories?.[0] || '',
                tags: inner.taxonomy?.attributes || [],
                images: inner.images?.map((img: any) => typeof img === 'string' ? img : img.url) || [],
                variants
              };
            }
            return item;
          });
        }
        return response;
      },
      providesTags: ['Products'],
    }),

    // GET /products/trending/week
    getTrendingProductsThisWeek: builder.query<any, void>({
      query: () => ({ url: '/products/trending/week', method: 'GET' }),
      providesTags: ['Products'],
    }),

    // PATCH /products/{product_id}/status — update product status
    updateProductStatus: builder.mutation<
      any,
      { productId: string; status: 'active' | 'draft' | 'archived' }
    >({
      query: ({ productId, status }) => ({
        url: `/products/${productId}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Product', 'Products'],
    }),

    // PATCH /products/{product_id}/schedule-activation
    scheduleProductActivation: builder.mutation<
      any,
      { productId: string; activation_date: string }
    >({
      query: ({ productId, activation_date }) => ({
        url: `/products/${productId}/schedule-activation`,
        method: 'PATCH',
        body: { activation_date },
      }),
      invalidatesTags: ['Product', 'Products'],
    }),

    // PATCH /products/{product_id}/fabrics/{fabric_id}/stock
    updateFabricStock: builder.mutation<
      any,
      { productId: string; fabricId: string; new_yard_length: number }
    >({
      query: ({ productId, fabricId, new_yard_length }) => ({
        url: `/products/${productId}/fabrics/${fabricId}/stock`,
        method: 'PATCH',
        body: { new_yard_length },
      }),
      invalidatesTags: ['Product', 'Products'],
    }),

    // PATCH /products/{product_id}/accessories/{accessoryId}/variants
    updateAccessoryVariantStock: builder.mutation<
      any,
      { productId: string; accessoryId: string; variant_id: string; new_stock: number }
    >({
      query: ({ productId, accessoryId, variant_id, new_stock }) => ({
        url: `/products/${productId}/accessories/${accessoryId}/variants`,
        method: 'PATCH',
        body: { variant_id, new_stock },
      }),
      invalidatesTags: ['Product', 'Products'],
    }),

    // POST /products/{id}/rate — rate a product (1–5 stars)
    rateProduct: builder.mutation<
      any,
      { id: string; value: number; comment?: string }
    >({
      query: ({ id, value, comment }) => ({
        url: `/products/${id}/rate`,
        method: 'POST',
        body: { value, comment },
      }),
      invalidatesTags: ['ProductReviews', 'Product'],
    }),

    // GET /products/{id}/ratings — rating summary and reviews
    getProductRatings: builder.query<any, string>({
      query: (id) => ({ url: `/products/${id}/ratings`, method: 'GET' }),
      providesTags: ['ProductReviews'],
    }),

    // POST /products/{id}/wishlist — toggle product in wishlist
    toggleProductWishlist: builder.mutation<any, string>({
      query: (id) => ({ url: `/products/${id}/wishlist`, method: 'POST' }),
      invalidatesTags: ['ProductLikes'],
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
  // Reconciled Qlozet endpoints
  useCreateFabricMutation,
  useGetProductsByVendorQuery,
  useLazyGetProductsByVendorQuery,
  useGetTrendingProductsThisWeekQuery,
  useUpdateProductStatusMutation,
  useScheduleProductActivationMutation,
  useUpdateFabricStockMutation,
  useUpdateAccessoryVariantStockMutation,
  useRateProductMutation,
  useGetProductRatingsQuery,
  useToggleProductWishlistMutation,
} = productsApiSlice;

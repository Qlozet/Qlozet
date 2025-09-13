import { baseAPI } from "../../api/base-api";

// Types for products
export interface Product {
  _id?: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  stock: number;
  status: "active" | "draft" | "inactive";
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

export interface Category {
  _id: string;
  name: string;
  description?: string;
  parentId?: string;
  status: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  category: string;
  price: number;
  stock: number;
  status: "active" | "draft" | "inactive";
  images: string[];
  variants?: Omit<ProductVariant, 'id'>[];
  customizations?: Omit<ProductCustomization, 'id'>[];
  tags?: string[];
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  _id: string;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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
export const productsApi = baseAPI.injectEndpoints({
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
      providesTags: ['Products']
    }),

    // Get single product by ID
    getProduct: builder.query<Product, string>({
      query: (id) => ({
        url: `/products/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Product', id }],
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
      invalidatesTags: (result, error, { _id }) => [
        { type: 'Product', id: _id },
        { type: 'Products',},
      ],
    }),

    // Delete product
    deleteProduct: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Product', id },
        { type: 'Products' },
      ],
    }),

    // Get categories
    getCategories: builder.query<Category[], void>({
      query: () => ({
        url: '/categories',
        method: 'GET',
      }),
      providesTags: [{ type: 'Category', id: 'LIST' }],
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
      invalidatesTags: [{ type: 'Product', id: 'LIST' }],
    }),

    // Get product analytics/stats
    getProductStats: builder.query<{
      totalProducts: number;
      activeProducts: number;
      draftProducts: number;
      inactiveProducts: number;
      lowStockProducts: number;
    }, void>({
      query: () => ({
        url: '/products/stats',
        method: 'GET',
      }),
    }),
  }),
});

// Update base API tag types
export const enhancedBaseAPI = baseAPI.enhanceEndpoints({
  addTagTypes: ['Product', 'Category', 'Products'],
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
} = productsApi;
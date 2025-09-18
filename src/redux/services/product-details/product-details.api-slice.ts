// Product Details API Slice
// RTK Query service for individual product details API operations

import { baseAPI } from '@/redux/api/base-api';

// API Response Types
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface ProductColor {
  hex: string;
  name?: string;
}

interface ProductVariant {
  id: string;
  color: ProductColor;
  images: Array<{
    secure_url: string;
    public_id: string;
  }>;
  sizes?: string[];
  price?: number;
  quantity?: number;
}

interface ProductSubcategory {
  id: string;
  name: string;
  category?: string;
}

interface ProductImage {
  secure_url: string;
  public_id: string;
}

interface ProductReview {
  id: string;
  rating: number;
  comment: string;
  customerName: string;
  createdAt: string;
}

interface ProductLike {
  id: string;
  customerId: string;
  createdAt: string;
}

interface DetailedProduct {
  id: string;
  name: string;
  price: number;
  tag: string;
  description: string;
  quantity: number;
  type: string;
  discount: number;
  isFeatured: boolean;
  colors: ProductColor[];
  variants: ProductVariant[];
  subcategories: ProductSubcategory[];
  images: ProductImage[];
  likes: ProductLike[];
  reviews: ProductReview[];
  createdAt: string;
  updatedAt: string;
  vendor?: {
    id: string;
    businessName: string;
    email: string;
  };
  category?: {
    id: string;
    name: string;
  };
  status: 'active' | 'inactive' | 'draft';
}

// API Slice
export const productDetailsApiSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    // Get detailed product information
    getProductDetails: builder.query<DetailedProduct, string>({
      query: (productId) => ({
        url: `/vendor/products/${productId}`,
        method: 'GET',
      }),
      providesTags: ['ProductDetails', 'ProductReviews', 'ProductLikes'],
    }),

    // Get product reviews
    getProductReviews: builder.query<
      ProductReview[],
      { productId: string; page?: number; limit?: number }
    >({
      query: ({ productId, page = 1, limit = 10 }) => ({
        url: `/vendor/products/${productId}/reviews`,
        method: 'GET',
        params: {
          page,
          limit,
        },
      }),
      providesTags: ['ProductReviews'],
    }),

    // Get product analytics/stats
    getProductAnalytics: builder.query<
      {
        totalViews: number;
        totalLikes: number;
        totalReviews: number;
        averageRating: number;
        totalSales: number;
        conversionRate: number;
      },
      string
    >({
      query: (productId) => ({
        url: `/vendor/products/${productId}/analytics`,
        method: 'GET',
      }),
    }),

    // Update product status
    updateProductStatus: builder.mutation<
      ApiResponse<DetailedProduct>,
      {
        productId: string;
        status: 'active' | 'inactive' | 'draft';
      }
    >({
      query: ({ productId, status }) => ({
        url: `/vendor/products/${productId}/status`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['ProductDetails'],
    }),

    // Toggle product featured status
    toggleProductFeatured: builder.mutation<
      ApiResponse<DetailedProduct>,
      {
        productId: string;
        isFeatured: boolean;
      }
    >({
      query: ({ productId, isFeatured }) => ({
        url: `/vendor/products/${productId}/featured`,
        method: 'PUT',
        body: { isFeatured },
      }),
      invalidatesTags: ['ProductDetails'],
    }),

    // Update product inventory
    updateProductInventory: builder.mutation<
      ApiResponse<DetailedProduct>,
      {
        productId: string;
        quantity: number;
        variants?: Array<{ id: string; quantity: number }>;
      }
    >({
      query: ({ productId, quantity, variants }) => ({
        url: `/vendor/products/${productId}/inventory`,
        method: 'PUT',
        body: { quantity, variants },
      }),
      invalidatesTags: ['ProductDetails'],
    }),

    // Delete product
    deleteProduct: builder.mutation<ApiResponse<null>, string>({
      query: (productId) => ({
        url: `/vendor/products/${productId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ProductDetails'],
    }),

    // Duplicate product
    duplicateProduct: builder.mutation<
      ApiResponse<DetailedProduct>,
      {
        productId: string;
        newName?: string;
      }
    >({
      query: ({ productId, newName }) => ({
        url: `/vendor/products/${productId}/duplicate`,
        method: 'POST',
        body: { newName },
      }),
    }),

    // Get similar products
    getSimilarProducts: builder.query<
      DetailedProduct[],
      {
        productId: string;
        limit?: number;
      }
    >({
      query: ({ productId, limit = 4 }) => ({
        url: `/vendor/products/${productId}/similar`,
        method: 'GET',
        params: {
          limit,
        },
      }),
    }),
  }),
});

// Export hooks
export const {
  useGetProductDetailsQuery,
  useGetProductReviewsQuery,
  useGetProductAnalyticsQuery,
  useUpdateProductStatusMutation,
  useToggleProductFeaturedMutation,
  useUpdateProductInventoryMutation,
  useDeleteProductMutation,
  useDuplicateProductMutation,
  useGetSimilarProductsQuery,
} = productDetailsApiSlice;

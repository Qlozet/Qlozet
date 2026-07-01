// Collections API Slice
// RTK Query service for the Qlozet "Collections" tag (product collections).

import { baseAPI } from '@/redux/api/base-api';
import { ApiResponse, PaginatedData, buildQueryString } from '../types';

// ConditionDto
export type CollectionConditionOperator =
  | 'is_equal_to'
  | 'not_equal_to'
  | 'greater_than'
  | 'less_than';

export interface CollectionCondition {
  field: string;
  operator: CollectionConditionOperator;
  value: string;
}

// CreateCollectionDto
export interface CreateCollectionRequest {
  title: string;
  description?: string;
  condition_match: 'all' | 'any';
  conditions: CollectionCondition[];
  is_active?: boolean;
}

// UpdateCollectionDto — all fields optional; adds cover_image + sort_order.
export interface UpdateCollectionDto {
  title?: string;
  description?: string;
  condition_match?: 'all' | 'any';
  conditions?: CollectionCondition[];
  is_active?: boolean;
  cover_image?: string;
  sort_order?: number;
}

export type UpdateCollectionRequest = UpdateCollectionDto & {
  collectionId: string;
};

export interface Collection {
  _id: string;
  title?: string;
  description?: string;
  condition_match?: 'all' | 'any';
  conditions?: CollectionCondition[];
  is_active?: boolean;
  products?: unknown[];
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface GetVendorCollectionsParams {
  condition_match?: string;
  is_active?: boolean;
  search?: string;
}

// ---- API Slice ----
export const collectionsApiSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    // GET /collections — all collections
    getCollections: builder.query<ApiResponse<Collection[]>, void>({
      query: () => ({ url: '/collections', method: 'GET' }),
      providesTags: ['Collections'],
    }),

    // GET /collections/vendor — collections owned by the current vendor
    getVendorCollections: builder.query<ApiResponse<Collection[]>, void>({
      query: () => ({ url: '/collections/vendor', method: 'GET' }),
      providesTags: ['Collections'],
    }),

    // GET /collections/vendor/with-products — vendor collections incl. products.
    // The array is nested under a paginated envelope: response.data.data.
    getVendorCollectionsWithProducts: builder.query<
      ApiResponse<PaginatedData<Collection>>,
      GetVendorCollectionsParams | void
    >({
      query: (params) => ({
        url: `/collections/vendor/with-products${buildQueryString({
          ...(params ?? {}),
        })}`,
        method: 'GET',
      }),
      providesTags: ['Collections'],
    }),

    // GET /collections/{collectionId}
    getCollection: builder.query<ApiResponse<Collection>, string>({
      query: (collectionId) => ({
        url: `/collections/${collectionId}`,
        method: 'GET',
      }),
      providesTags: ['Collection'],
    }),

    // GET /collections/{collectionId}/products
    getCollectionProducts: builder.query<ApiResponse<unknown[]>, string>({
      query: (collectionId) => ({
        url: `/collections/${collectionId}/products`,
        method: 'GET',
      }),
      providesTags: ['Collection'],
    }),

    // POST /collections — create a vendor collection
    createCollection: builder.mutation<
      ApiResponse<Collection>,
      CreateCollectionRequest
    >({
      query: (body) => ({ url: '/collections', method: 'POST', body }),
      invalidatesTags: ['Collections'],
    }),

    // PATCH /collections/{collectionId} — update a vendor collection
    updateCollection: builder.mutation<
      ApiResponse<Collection>,
      UpdateCollectionRequest
    >({
      query: ({ collectionId, ...body }) => ({
        url: `/collections/${collectionId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Collections', 'Collection'],
    }),

    // DELETE /collections/{collectionId} — delete a vendor collection
    deleteCollection: builder.mutation<ApiResponse<unknown>, string>({
      query: (collectionId) => ({
        url: `/collections/${collectionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Collections'],
    }),
  }),
});

// ---- Hooks ----
export const {
  useGetCollectionsQuery,
  useGetVendorCollectionsQuery,
  useGetVendorCollectionsWithProductsQuery,
  useGetCollectionQuery,
  useGetCollectionProductsQuery,
  useCreateCollectionMutation,
  useUpdateCollectionMutation,
  useDeleteCollectionMutation,
} = collectionsApiSlice;

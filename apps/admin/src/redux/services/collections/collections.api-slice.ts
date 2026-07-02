// Collections API Slice (Admin)
// RTK Query service for the Qlozet "Collections" tag — the admin app manages
// platform-wide collections (POST/GET/PATCH/DELETE /collections/admin/platform)
// and reads the public platform storefront collections (/collections/platform).

import { baseAPI } from '@/redux/api/base-api';
import { ApiResponse, buildQueryString } from '../types';

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

export interface Collection {
  _id: string;
  title?: string;
  description?: string;
  condition_match?: 'all' | 'any';
  conditions?: CollectionCondition[];
  is_active?: boolean;
  slug?: string;
  cover_image?: string;
  sort_order?: number;
  products?: unknown[];
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

// CreatePlatformCollectionDto
export interface CreatePlatformCollectionRequest {
  title: string;
  description?: string;
  condition_match: 'all' | 'any';
  conditions: CollectionCondition[];
  is_active?: boolean;
  slug?: string;
  cover_image?: string;
  sort_order?: number;
}

// UpdateCollectionDto — all fields optional.
export interface UpdateCollectionDto {
  title?: string;
  description?: string;
  condition_match?: 'all' | 'any';
  conditions?: CollectionCondition[];
  is_active?: boolean;
  cover_image?: string;
  sort_order?: number;
}

export type UpdatePlatformCollectionRequest = UpdateCollectionDto & {
  id: string;
};

export interface GetPlatformCollectionParams {
  page?: number;
  limit?: number;
}

// ---- API Slice ----
export const collectionsApiSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    // GET /collections/admin/platform — all platform collections (incl inactive)
    getPlatformCollectionsAdmin: builder.query<ApiResponse<Collection[]>, void>({
      query: () => ({ url: '/collections/admin/platform', method: 'GET' }),
      providesTags: ['Collections'],
    }),

    // POST /collections/admin/platform — create a platform-wide collection
    createPlatformCollection: builder.mutation<
      ApiResponse<Collection>,
      CreatePlatformCollectionRequest
    >({
      query: (body) => ({
        url: '/collections/admin/platform',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Collections'],
    }),

    // PATCH /collections/admin/platform/{id} — update a platform collection
    updatePlatformCollection: builder.mutation<
      ApiResponse<Collection>,
      UpdatePlatformCollectionRequest
    >({
      query: ({ id, ...body }) => ({
        url: `/collections/admin/platform/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Collections', 'Collection'],
    }),

    // DELETE /collections/admin/platform/{id} — delete a platform collection
    deletePlatformCollection: builder.mutation<ApiResponse<unknown>, string>({
      query: (id) => ({
        url: `/collections/admin/platform/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Collections'],
    }),

    // GET /collections/platform — active platform collections (public storefront)
    getActivePlatformCollections: builder.query<ApiResponse<Collection[]>, void>({
      query: () => ({ url: '/collections/platform', method: 'GET' }),
      providesTags: ['Collections'],
    }),

    // GET /collections/platform/{idOrSlug} — a platform collection with products
    getPlatformCollection: builder.query<
      ApiResponse<Collection>,
      { idOrSlug: string } & GetPlatformCollectionParams
    >({
      query: ({ idOrSlug, ...params }) => ({
        url: `/collections/platform/${idOrSlug}${buildQueryString({ ...params })}`,
        method: 'GET',
      }),
      providesTags: ['Collection'],
    }),
  }),
});

// ---- Hooks ----
export const {
  useGetPlatformCollectionsAdminQuery,
  useCreatePlatformCollectionMutation,
  useUpdatePlatformCollectionMutation,
  useDeletePlatformCollectionMutation,
  useGetActivePlatformCollectionsQuery,
  useGetPlatformCollectionQuery,
} = collectionsApiSlice;

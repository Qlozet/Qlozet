// Taxonomy API Slice (Admin)
// Two consumers:
//  - the collections builder reads the public tree for its dropdowns
//    (getTaxonomyTree, unchanged);
//  - the Products → Taxonomy management page administers the platform-wide
//    taxonomy itself. Products reference taxonomy BY NAME
//    (clothing.taxonomy.product_type, fabric.product_type, tags[].slug), so
//    the admin overview ships live usage counts — the UI warns before renaming
//    an in-use product type and blocks deleting one.
//
//   GET    /taxonomy/tree             (public, active rows only)
//   GET    /taxonomy/admin/overview   (all rows incl. inactive + usage counts)
//   POST   /taxonomy                  (create category)
//   PATCH  /taxonomy/:id
//   DELETE /taxonomy/:id
//   POST   /taxonomy/tags             (create tag)
//   PATCH  /taxonomy/tags/:id
//   DELETE /taxonomy/tags/:id
//   POST   /taxonomy/seed             (idempotent default seed)

import { baseAPI } from '@/redux/api/base-api';

export interface TaxonomyTreeItem {
  _id: string;
  name: string;
  categories: string[];
  attributes: string[];
  icon: string | null;
  sort_order: number;
}

export interface TaxonomyTree {
  [kind: string]: { product_types: TaxonomyTreeItem[] };
}

export type TaxonomyKind = 'clothing' | 'fabric' | 'accessory';
export type TagAssignableBy = 'admin_only' | 'vendor';

export interface SystemCategory {
  _id: string;
  kind: TaxonomyKind;
  product_type: string;
  categories: string[];
  attributes: string[];
  icon?: string | null;
  sort_order: number;
  is_active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SystemTag {
  _id: string;
  name: string;
  slug: string;
  kind?: TaxonomyKind | null;
  assignable_by: TagAssignableBy;
  sort_order: number;
  is_active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TaxonomyOverview {
  categories: SystemCategory[];
  tags: SystemTag[];
  /** Live products per (kind, product_type). Missing pair → 0 products. */
  type_usage: { kind: TaxonomyKind; product_type: string; count: number }[];
  /** Live products per tag slug. */
  tag_usage: { slug: string; count: number }[];
}

export interface CreateSystemCategoryRequest {
  kind: TaxonomyKind;
  product_type: string;
  categories?: string[];
  attributes?: string[];
  icon?: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface CreateSystemTagRequest {
  name: string;
  kind?: TaxonomyKind;
  assignable_by: TagAssignableBy;
  sort_order?: number;
  is_active?: boolean;
}

/** Unwrap the response envelope down to the service payload. */
function unwrap<T>(response: unknown): T {
  let v: unknown = response;
  while (
    v &&
    typeof v === 'object' &&
    'data' in (v as Record<string, unknown>) &&
    !('categories' in (v as Record<string, unknown>)) &&
    !('_id' in (v as Record<string, unknown>))
  ) {
    v = (v as { data: unknown }).data;
  }
  return v as T;
}

export const taxonomyApiSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    getTaxonomyTree: builder.query<TaxonomyTree, string | void>({
      query: (kind) => ({
        url: `/taxonomy/tree${kind ? `?kind=${kind}` : ''}`,
        method: 'GET',
      }),
      transformResponse: (res: { data?: TaxonomyTree } | TaxonomyTree) =>
        (res as { data?: TaxonomyTree })?.data ?? (res as TaxonomyTree),
      providesTags: ['Taxonomy'],
    }),

    getTaxonomyOverview: builder.query<TaxonomyOverview, void>({
      query: () => ({ url: '/taxonomy/admin/overview', method: 'GET' }),
      transformResponse: (r: unknown) => unwrap<TaxonomyOverview>(r),
      providesTags: ['Taxonomy'],
    }),

    createTaxonomyCategory: builder.mutation<
      SystemCategory,
      CreateSystemCategoryRequest
    >({
      query: (body) => ({ url: '/taxonomy', method: 'POST', body }),
      invalidatesTags: ['Taxonomy'],
    }),

    updateTaxonomyCategory: builder.mutation<
      SystemCategory,
      { id: string; data: Partial<CreateSystemCategoryRequest> }
    >({
      query: ({ id, data }) => ({
        url: `/taxonomy/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Taxonomy'],
    }),

    deleteTaxonomyCategory: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/taxonomy/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Taxonomy'],
    }),

    createTaxonomyTag: builder.mutation<SystemTag, CreateSystemTagRequest>({
      query: (body) => ({ url: '/taxonomy/tags', method: 'POST', body }),
      invalidatesTags: ['Taxonomy'],
    }),

    updateTaxonomyTag: builder.mutation<
      SystemTag,
      { id: string; data: Partial<CreateSystemTagRequest> }
    >({
      query: ({ id, data }) => ({
        url: `/taxonomy/tags/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Taxonomy'],
    }),

    deleteTaxonomyTag: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/taxonomy/tags/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Taxonomy'],
    }),

    seedTaxonomy: builder.mutation<unknown, void>({
      // Idempotent: existing kind+product_type pairs and tag slugs are skipped.
      query: () => ({ url: '/taxonomy/seed', method: 'POST' }),
      invalidatesTags: ['Taxonomy'],
    }),
  }),
});

export const {
  useGetTaxonomyTreeQuery,
  useGetTaxonomyOverviewQuery,
  useCreateTaxonomyCategoryMutation,
  useUpdateTaxonomyCategoryMutation,
  useDeleteTaxonomyCategoryMutation,
  useCreateTaxonomyTagMutation,
  useUpdateTaxonomyTagMutation,
  useDeleteTaxonomyTagMutation,
  useSeedTaxonomyMutation,
} = taxonomyApiSlice;

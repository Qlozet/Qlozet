import { baseAPI } from '../../api/base-api';

// Types matching the backend taxonomy response
export interface ProductTypeItem {
  name: string;
  icon: string | null;
}

export interface CategoryResponse {
  product_type: string;
  categories: string[];
  attributes: string[];
}

export interface SystemTagItem {
  _id: string;
  name: string;
  slug: string;
  assignable_by: 'admin_only' | 'vendor';
  kind?: string;
  is_active: boolean;
}

export interface TaxonomyTreeItem {
  _id: string;
  name: string;
  categories: string[];
  attributes: string[];
  icon: string | null;
  sort_order: number;
}

export interface TaxonomyTree {
  [kind: string]: {
    product_types: TaxonomyTreeItem[];
  };
}

// Tag object stored on products
export interface ProductTag {
  name: string;
  slug: string;
  type: 'system' | 'custom';
}

export const taxonomyApiSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    // Product types for a kind (first dropdown)
    getProductTypes: builder.query<ProductTypeItem[], string>({
      query: (kind) => `/api/taxonomy/product-types?kind=${kind}`,
      providesTags: ['Taxonomy'],
    }),

    // Sub-categories for a product type (cascading dropdown)
    getCategoriesForType: builder.query<
      CategoryResponse,
      { kind: string; product_type: string }
    >({
      query: ({ kind, product_type }) =>
        `/api/taxonomy/categories?kind=${kind}&product_type=${encodeURIComponent(product_type)}`,
      providesTags: ['Taxonomy'],
    }),

    // Vendor-selectable tags
    getVendorTags: builder.query<SystemTagItem[], void>({
      query: () => `/api/taxonomy/tags?assignable_by=vendor`,
      providesTags: ['Taxonomy'],
    }),

    // Full tree (for bulk loading)
    getTaxonomyTree: builder.query<TaxonomyTree, string | void>({
      query: (kind) => `/api/taxonomy/tree${kind ? `?kind=${kind}` : ''}`,
      providesTags: ['Taxonomy'],
    }),
  }),
});

export const {
  useGetProductTypesQuery,
  useGetCategoriesForTypeQuery,
  useGetVendorTagsQuery,
  useGetTaxonomyTreeQuery,
} = taxonomyApiSlice;

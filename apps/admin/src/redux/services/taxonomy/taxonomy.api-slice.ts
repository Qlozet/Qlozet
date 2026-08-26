// Taxonomy API Slice (Admin)
// Minimal read-only access to the product taxonomy tree, used to populate the
// condition-value dropdowns in the collections builder.

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

export const taxonomyApiSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    getTaxonomyTree: builder.query<TaxonomyTree, string | void>({
      query: (kind) => ({
        url: `/taxonomy/tree${kind ? `?kind=${kind}` : ''}`,
        method: 'GET',
      }),
      transformResponse: (res: { data?: TaxonomyTree } | TaxonomyTree) =>
        (res as { data?: TaxonomyTree })?.data ?? (res as TaxonomyTree),
    }),
  }),
});

export const { useGetTaxonomyTreeQuery } = taxonomyApiSlice;

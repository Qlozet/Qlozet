// Help Center API Slice
// Admin CRUD over the help-article knowledge base (FAQs, guides, policies).
// Bodies are markdown and may embed {{platform_setting_key}} placeholders
// which the PUBLIC endpoints interpolate from live settings; admin routes
// return raw bodies so placeholders stay editable.

import { baseAPI } from '@/redux/api/base-api';
import { ApiResponse } from '../types';

export interface HelpArticle {
  _id: string;
  title: string;
  body: string;
  category: string;
  audience: 'customer' | 'vendor' | 'both';
  published: boolean;
  featured: boolean;
  order: number;
  views: number;
  helpful_yes: number;
  helpful_no: number;
  created_by?: { _id: string; full_name?: string } | string | null;
  createdAt?: string;
  updatedAt?: string;
}

export type SaveHelpArticleRequest = Partial<
  Pick<
    HelpArticle,
    | 'title'
    | 'body'
    | 'category'
    | 'audience'
    | 'published'
    | 'featured'
    | 'order'
  >
>;

export const helpCenterApiSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    getHelpArticles: builder.query<ApiResponse<HelpArticle[]>, void>({
      query: () => ({ url: '/help/admin/articles', method: 'GET' }),
      providesTags: ['HelpArticles'],
    }),

    createHelpArticle: builder.mutation<
      ApiResponse<HelpArticle>,
      SaveHelpArticleRequest
    >({
      query: (body) => ({ url: '/help/admin/articles', method: 'POST', body }),
      invalidatesTags: ['HelpArticles'],
    }),

    updateHelpArticle: builder.mutation<
      ApiResponse<HelpArticle>,
      { id: string; data: SaveHelpArticleRequest }
    >({
      query: ({ id, data }) => ({
        url: `/help/admin/articles/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['HelpArticles'],
    }),

    deleteHelpArticle: builder.mutation<ApiResponse<{ _id: string }>, string>({
      query: (id) => ({ url: `/help/admin/articles/${id}`, method: 'DELETE' }),
      invalidatesTags: ['HelpArticles'],
    }),
  }),
});

export const {
  useGetHelpArticlesQuery,
  useCreateHelpArticleMutation,
  useUpdateHelpArticleMutation,
  useDeleteHelpArticleMutation,
} = helpCenterApiSlice;

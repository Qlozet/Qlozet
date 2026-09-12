// Help Center API Slice (vendor console)
// Read-only: published vendor-audience articles from the platform knowledge
// base. Bodies arrive with {{platform_setting_key}} placeholders already
// interpolated to live values.

import { baseAPI } from '@/redux/api/base-api';

export interface HelpArticle {
  _id: string;
  title: string;
  body: string;
  category: string;
  featured?: boolean;
}

/** Unwrap the response envelope down to the article array. */
function unwrap(response: unknown): HelpArticle[] {
  let v: unknown = response;
  while (
    v &&
    typeof v === 'object' &&
    !Array.isArray(v) &&
    'data' in (v as Record<string, unknown>)
  ) {
    v = (v as { data: unknown }).data;
  }
  return Array.isArray(v) ? (v as HelpArticle[]) : [];
}

export const helpCenterApiSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    getVendorHelpArticles: builder.query<HelpArticle[], void>({
      query: () => ({ url: '/help/articles?audience=vendor', method: 'GET' }),
      transformResponse: unwrap,
      providesTags: ['HelpArticles'],
    }),
    sendHelpFeedback: builder.mutation<
      unknown,
      { id: string; helpful: boolean }
    >({
      query: ({ id, helpful }) => ({
        url: `/help/articles/${id}/feedback`,
        method: 'POST',
        body: { helpful },
      }),
    }),
  }),
});

export const { useGetVendorHelpArticlesQuery, useSendHelpFeedbackMutation } =
  helpCenterApiSlice;

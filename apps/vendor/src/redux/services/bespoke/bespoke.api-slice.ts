// Bespoke Quotes API Slice
// RTK Query service for the vendor custom-order quote flow (bespoke quotes).
// Real Qlozet endpoints under /bespoke/quotes (see Swagger).

import { baseAPI } from '@/redux/api/base-api';
import { ApiResponse } from '../types';

// LineItemDto — a single priced line on a quote (Base Tailoring, Fabric, ...).
export interface QuoteLineItem {
  label: string;
  amount: number;
}

// SubmitQuoteDto / SaveDraftDto share this shape.
export interface QuotePayload {
  line_items: QuoteLineItem[];
  required_fabric_yards: number;
  estimated_completion_days: number;
  vendor_notes?: string;
}

// Quote responses are not documented in Swagger, so the shape is loose.
export interface BespokeQuote {
  _id: string;
  status?: string;
  line_items?: QuoteLineItem[];
  required_fabric_yards?: number;
  estimated_completion_days?: number;
  vendor_notes?: string;
  [key: string]: unknown;
}

export const bespokeApiSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    // GET /bespoke/quotes/vendor — the vendor's quotes
    getVendorQuotes: builder.query<ApiResponse<BespokeQuote[]>, void>({
      query: () => ({ url: '/bespoke/quotes/vendor', method: 'GET' }),
      providesTags: ['Orders'],
    }),

    // GET /bespoke/quotes/{id}
    getQuote: builder.query<ApiResponse<BespokeQuote>, string>({
      query: (id) => ({ url: `/bespoke/quotes/${id}`, method: 'GET' }),
      providesTags: ['Orders'],
    }),

    // PATCH /bespoke/quotes/{id}/draft — save a work-in-progress quote
    saveQuoteDraft: builder.mutation<
      ApiResponse<BespokeQuote>,
      { id: string; data: QuotePayload }
    >({
      query: ({ id, data }) => ({
        url: `/bespoke/quotes/${id}/draft`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Orders'],
    }),

    // POST /bespoke/quotes/{id}/submit — submit the quote to the customer
    submitQuote: builder.mutation<
      ApiResponse<BespokeQuote>,
      { id: string; data: QuotePayload }
    >({
      query: ({ id, data }) => ({
        url: `/bespoke/quotes/${id}/submit`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Orders'],
    }),
  }),
});

export const {
  useGetVendorQuotesQuery,
  useGetQuoteQuery,
  useSaveQuoteDraftMutation,
  useSubmitQuoteMutation,
} = bespokeApiSlice;

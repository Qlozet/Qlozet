// Tokens API Slice
// RTK Query service for the Qlozet "Tokens" tag (platform measurement tokens).

import { baseAPI } from '@/redux/api/base-api';
import { ApiResponse } from '../types';

export interface TokenBalance {
  balance?: number;
  active_tokens?: number;
  currency?: string;
  [key: string]: unknown;
}

// PurchaseDto is an open object on the backend; callers pass the purchase payload.
export type PurchaseTokensRequest = Record<string, unknown>;

// ---- API Slice ----
export const tokensApiSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    // GET /token/balance — active token balance
    getTokenBalance: builder.query<ApiResponse<TokenBalance>, void>({
      query: () => ({ url: '/token/balance', method: 'GET' }),
      providesTags: ['TokenBalance'],
    }),

    // POST /token/vendor/purchase — purchase tokens for the vendor business
    purchaseVendorTokens: builder.mutation<
      ApiResponse<unknown>,
      PurchaseTokensRequest
    >({
      query: (body) => ({ url: '/token/vendor/purchase', method: 'POST', body }),
      invalidatesTags: ['TokenBalance'],
    }),

    // POST /token/customer/purchase — purchase tokens for a customer
    purchaseCustomerTokens: builder.mutation<
      ApiResponse<unknown>,
      PurchaseTokensRequest
    >({
      query: (body) => ({
        url: '/token/customer/purchase',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['TokenBalance'],
    }),
  }),
});

// ---- Hooks ----
export const {
  useGetTokenBalanceQuery,
  usePurchaseVendorTokensMutation,
  usePurchaseCustomerTokensMutation,
} = tokensApiSlice;

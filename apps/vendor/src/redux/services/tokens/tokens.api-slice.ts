// Tokens API Slice
// RTK Query service for the Qlozet "Tokens" tag (platform measurement tokens).

import { baseAPI } from '@/redux/api/base-api';
import { ApiResponse } from '../types';

export interface TokenBalance {
  balance?: number;
  active_tokens?: number;
  tokens?: number;
  currency?: string;
  [key: string]: unknown;
}

/** A pack on sale (GET /token/packs): admin-set, priced by the server. */
export interface TokenPack {
  id: string;
  name: string;
  tokens: number;
  bonus_tokens: number;
  total_tokens: number;
  price_ngn: number;
  tag: string | null;
  /** About how many AI designs the pack covers. */
  designs: number | null;
}

export interface TokenPacksResponse {
  packs: TokenPack[];
  design_token_price: number;
}

/** Buy a pack by id; the server sets the price and the tokens. */
export type PurchaseTokensRequest = { pack_id: string };

// ---- API Slice ----
export const tokensApiSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    // GET /token/packs — the packs on sale (public, admin-set)
    getTokenPacks: builder.query<TokenPacksResponse, void>({
      query: () => ({ url: '/token/packs', method: 'GET' }),
    }),

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
      query: (body) => ({
        url: '/token/vendor/purchase',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['TokenBalance', 'WalletBalance', 'Transaction'],
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
      invalidatesTags: ['TokenBalance', 'WalletBalance', 'Transaction'],
    }),
  }),
});

// ---- Hooks ----
export const {
  useGetTokenPacksQuery,
  useGetTokenBalanceQuery,
  usePurchaseVendorTokensMutation,
  usePurchaseCustomerTokensMutation,
} = tokensApiSlice;

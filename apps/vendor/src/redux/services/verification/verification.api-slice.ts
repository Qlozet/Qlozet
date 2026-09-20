// Verification API Slice
// QoreID-backed vendor verification: vNIN identity, CAC registered-business
// and NUBAN payout-account checks. The backend stores only storage-safe
// summaries (verdict, provider ref, verified name, masked id).

import { baseAPI } from '@/redux/api/base-api';
import { ApiResponse } from '../types';

export interface IdentityVerification {
  status: 'verified' | 'failed';
  id_type: string;
  verified_name?: string | null;
  masked_id?: string | null;
  match?: string | null;
  verified_at?: string | null;
}

export interface BusinessVerification {
  status: 'verified' | 'failed';
  rc_number?: string | null;
  company_name?: string | null;
  verified_at?: string | null;
}

export interface BankVerification {
  status: 'verified' | 'failed';
  account_number?: string | null;
  bank_code?: string | null;
  bank_name?: string | null;
  account_name?: string | null;
  verified_at?: string | null;
}

export interface VerificationState {
  configured: boolean;
  status: string;
  verification: {
    identity?: IdentityVerification | null;
    business?: BusinessVerification | null;
    bank?: BankVerification | null;
  };
}

const verificationAPI = baseAPI.enhanceEndpoints({
  addTagTypes: ['Verification'],
});

export const verificationApiSlice = verificationAPI.injectEndpoints({
  endpoints: (builder) => ({
    getVerification: builder.query<ApiResponse<VerificationState>, void>({
      query: () => ({ url: '/verification', method: 'GET' }),
      providesTags: ['Verification'],
    }),

    verifyVnin: builder.mutation<
      ApiResponse<{ verified: boolean; identity: IdentityVerification }>,
      { vnin: string; firstname?: string; lastname?: string }
    >({
      query: (body) => ({
        url: '/verification/identity/vnin',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Verification'],
    }),

    verifyCac: builder.mutation<
      ApiResponse<{ verified: boolean; business: BusinessVerification }>,
      { rc_number: string }
    >({
      query: (body) => ({
        url: '/verification/business/cac',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Verification'],
    }),

    // Verify the already-linked payout account (no body — the backend reads
    // the saved account and matches it against the verified identity name).
    verifyPayoutBank: builder.mutation<
      ApiResponse<{ verified: boolean; bank: BankVerification }>,
      void
    >({
      query: () => ({ url: '/verification/bank/payout', method: 'POST' }),
      invalidatesTags: ['Verification'],
    }),

    verifyBank: builder.mutation<
      ApiResponse<{ verified: boolean; bank: BankVerification }>,
      { account_number: string; bank_code: string; bank_name?: string }
    >({
      query: (body) => ({ url: '/verification/bank', method: 'POST', body }),
      invalidatesTags: ['Verification'],
    }),
  }),
});

export const {
  useGetVerificationQuery,
  useVerifyVninMutation,
  useVerifyCacMutation,
  useVerifyBankMutation,
  useVerifyPayoutBankMutation,
} = verificationApiSlice;

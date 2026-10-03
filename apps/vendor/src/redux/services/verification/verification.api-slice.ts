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

/** Where the business is in getting cleared to sell. */
export type VerificationStep =
  | 'not_started'
  | 'in_progress'
  | 'provider_complete'
  | 'awaiting_review'
  | 'approved'
  | 'action_required'
  | 'rejected';

export interface VerificationState {
  configured: boolean;
  /** False until QOREID_WORKFLOW_ID is set; the older cards are used then. */
  workflow_available: boolean;
  /** Trading status — only approved/verified may sell. */
  status: string;
  verification: {
    identity?: IdentityVerification | null;
    business?: BusinessVerification | null;
    bank?: BankVerification | null;
  };
  verification_state: VerificationStep;
  /** Written for the vendor, and the only thing they are told. */
  verification_message: string | null;
  attempts_used: number;
  attempts_allowed: number;
  can_start: boolean;
  service_agreement: {
    required_version: string;
    accepted: boolean;
    accepted_at: string | null;
    /** Signed an older version, so it has to be signed again. */
    outdated: boolean;
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

    /** The agreement text itself — served, not linked, so the words and the
     *  version a vendor accepts can never drift apart. */
    getServiceAgreement: builder.query<
      ApiResponse<{ version: string; current: boolean; body: string }>,
      string | void
    >({
      query: (version) => ({
        url: version
          ? `/verification/service-agreement?version=${encodeURIComponent(version)}`
          : '/verification/service-agreement',
        method: 'GET',
      }),
    }),

    /** Mints a hosted-workflow session. The token is single-use and expires
     *  in minutes, so it is fetched when the vendor clicks, not on page load. */
    startVerificationSession: builder.mutation<
      ApiResponse<{
        session_id: string;
        sdk_token: string;
        expires_at: string | null;
        reference: string;
      }>,
      void
    >({
      query: () => ({ url: '/verification/session', method: 'POST' }),
      invalidatesTags: ['Verification'],
    }),

    acceptServiceAgreement: builder.mutation<
      ApiResponse<{ message: string }>,
      { version: string }
    >({
      query: (body) => ({
        url: '/verification/service-agreement',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Verification'],
    }),

    /** Hand the finished checks to the Qlozet review queue. */
    submitForReview: builder.mutation<
      ApiResponse<{ verification_state: VerificationStep }>,
      void
    >({
      query: () => ({ url: '/verification/submit', method: 'POST' }),
      invalidatesTags: ['Verification'],
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

    // File the CAC certificate as supporting evidence. Separate from the RC
    // number check, and not conditional on it: the document matters most when
    // the automated lookup cannot settle things.
    fileCacDocument: builder.mutation<
      ApiResponse<{ cac_document_url: string[] }>,
      { document_url: string }
    >({
      query: (body) => ({
        url: '/verification/business/cac/document',
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
  useGetServiceAgreementQuery,
  useStartVerificationSessionMutation,
  useAcceptServiceAgreementMutation,
  useSubmitForReviewMutation,
  useFileCacDocumentMutation,
  useVerifyBankMutation,
  useVerifyPayoutBankMutation,
} = verificationApiSlice;

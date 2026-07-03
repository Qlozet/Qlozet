// Wallet API Slice
// RTK Query service for wallet-related API operations

import { baseAPI } from '@/redux/api/base-api';

// API Response Types
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// TODO(api): the Wallets endpoints have no documented response schemas yet
// (Swagger returns `200` with no body). Type their `data` as `unknown` for now
// and tighten these once the backend provides the shapes.
type PendingData = unknown;

// POST /wallets/fund initializes a Paystack transaction and returns the hosted
// checkout URL to redirect the user to (plus the reference used later by
// GET /wallets/verify/{reference}). Field names follow Paystack's initialize
// response; kept permissive since the envelope isn't documented in Swagger.
export interface FundWalletResponseData {
  authorization_url?: string;
  access_code?: string;
  reference?: string;
  [key: string]: unknown;
}

// Vendor transactions arrive loosely typed (the /transactions/vendor response
// shape is undocumented in Swagger), so keep this permissive and read fields
// tolerantly in the UI layer (see pattern/wallet/lib/transaction-fields.ts).
export type VendorTransaction = Record<string, unknown> & { _id?: string };

// GET /transactions/vendor is paginated and requires a `status` filter.
export interface VendorTransactionsParams {
  /** Transaction status filter. `all` returns every status. */
  status?: string;
  page?: number;
  size?: number;
}

// The endpoint returns a paginated envelope; the exact key names aren't
// documented, so the UI normalizes `data` tolerantly.
export interface PaginatedTransactions {
  data?: VendorTransaction[];
  total?: number;
  page?: number;
  size?: number;
}

interface Bank {
  id: string;
  name: string;
  code: string;
  slug?: string;
}

export interface Beneficiary {
  id: string;
  name: string;
  accountNumber: string;
  bankName: string;
  bankCode: string;
  amount?: string
  naration?: string
  schedulePayment?: boolean
}

interface CreateBeneficiaryRequest {
  name: string;
  accountNumber: string;
  bankCode: string;
}

interface TransferRequest {
  amount: number;
  beneficiaryId?: string;
  accountNumber?: string;
  bankCode?: string;
  narration?: string;
}

// API Slice
export const walletApiSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    // ─── Wallets ─────────────────────────────────────────────────────────────
    // https://qlozet-backend.fly.dev/api-docs#/Wallets

    // Get wallet balance (GET /wallet/balance)
    getWalletBalance: builder.query<ApiResponse<PendingData>, void>({
      query: () => ({
        url: '/wallet/balance',
        method: 'GET',
      }),
      providesTags: ['WalletBalance'],
    }),

    // Fund wallet via Paystack (POST /wallet/fund)
    fundWallet: builder.mutation<
      ApiResponse<FundWalletResponseData>,
      { amount: number; callback_url?: string }
    >({
      query: (body) => ({
        url: '/wallet/fund',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['WalletBalance', 'Transaction'],
    }),

    // Verify a Paystack payment and credit the wallet
    // (GET /wallet/verify/{reference})
    verifyWalletPayment: builder.query<ApiResponse<PendingData>, string>({
      query: (reference) => ({
        url: `/wallet/verify/${reference}`,
        method: 'GET',
      }),
      providesTags: ['WalletBalance', 'Transaction'],
    }),

    // Get token price quote (GET /wallet/price?tokens=&currency=)
    getWalletPrice: builder.query<
      ApiResponse<PendingData>,
      { tokens: number; currency: string }
    >({
      query: ({ tokens, currency }) => {
        const search = new URLSearchParams({
          tokens: String(tokens),
          currency,
        });
        return {
          url: `/wallet/price?${search.toString()}`,
          method: 'GET',
        };
      },
    }),

    // ─── Transactions ────────────────────────────────────────────────────────

    // Get vendor transactions (backend: GET /transactions/vendor).
    // Paginated; `status` is required by the backend ('all' returns everything).
    getWalletTransactions: builder.query<
      ApiResponse<PaginatedTransactions>,
      VendorTransactionsParams | void
    >({
      query: (params) => {
        const { status = 'all', page = 1, size = 100 } = params ?? {};
        const search = new URLSearchParams({
          status,
          page: String(page),
          size: String(size),
        });
        return {
          url: `/transactions/vendor?${search.toString()}`,
          method: 'GET',
        };
      },
      providesTags: ['Transaction'],
    }),

    // ─── Transfer / Beneficiaries ────────────────────────────────────────────
    // ⚠️ NOT in the backend Swagger. These `/vendor/*` URLs are unverified
    // guesses kept only so the legacy Send-money components still compile.
    // Reconcile against real endpoints before wiring the Send-money flow.

    // Get available banks
    getBanks: builder.query<ApiResponse<Bank[]>, void>({
      query: () => ({
        url: '/vendor/transfer/banks',
        method: 'GET',
      }),
      providesTags: ['Bank'],
    }),

    // Verify account number
    verifyAccountNumber: builder.query<
      ApiResponse<{ name: string }>,
      { accountNumber: string; bankCode: string }
    >({
      query: ({ accountNumber, bankCode }) => ({
        url: `/vendor/transfer/verify-account?accountNumber=${accountNumber}&bankCode=${bankCode}`,
        method: 'GET',
      }),
    }),

    // Get beneficiaries
    getBeneficiaries: builder.query<ApiResponse<Beneficiary[]>, void>({
      query: () => ({
        url: '/vendor/beneficiaries',
        method: 'GET',
      }),
      providesTags: ['Beneficiary'],
    }),

    // Create beneficiary
    createBeneficiary: builder.mutation<
      ApiResponse<Beneficiary>,
      CreateBeneficiaryRequest
    >({
      query: (data) => ({
        url: '/vendor/beneficiaries',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Beneficiary'],
    }),

    // Transfer money
    transferMoney: builder.mutation<ApiResponse<any>, TransferRequest>({
      query: (data) => ({
        url: '/vendor/transfer',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['WalletBalance', 'Transaction'],
    }),
  }),
});

// Export hooks
export const {
  useGetWalletBalanceQuery,
  useFundWalletMutation,
  useGetWalletPriceQuery,
  useGetWalletTransactionsQuery,
  useVerifyWalletPaymentQuery,
  useLazyVerifyWalletPaymentQuery,
  useGetBanksQuery,
  useLazyVerifyAccountNumberQuery,
  useGetBeneficiariesQuery,
  useCreateBeneficiaryMutation,
  useTransferMoneyMutation,
} = walletApiSlice;

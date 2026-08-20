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

// POST /wallets/withdraw - amount-only payout to the vendor's registered bank
// account. Minimum 2,000 NGN (also enforced server-side).
export interface WithdrawEarningsRequest {
  amount: number;
}

// ─── Payout (bank) account ───────────────────────────────────────────────────

// GET /wallets/banks — supported banks for the payout picker.
export interface Bank {
  name: string;
  code: string;
  slug?: string;
}

// GET /wallets/payout-account — the vendor's linked account (masked). `linked`
// is false and the rest null when nothing has been linked yet.
export interface PayoutAccount {
  linked: boolean;
  bank_name: string | null;
  bank_code: string | null;
  account_name: string | null;
  account_number: string | null; // masked, e.g. "******1234"
}

// POST /wallets/payout-account/resolve — confirm the account name before saving.
export interface ResolveAccountRequest {
  account_number: string;
  bank_code: string;
}
export interface ResolvedAccount {
  account_number: string;
  account_name: string;
  bank_code: string;
}

// POST /wallets/payout-account — link (create/replace) the payout account.
export interface LinkPayoutAccountRequest {
  name: string; // account holder name (from resolve)
  account_number: string;
  bank_code: string;
  bank_name?: string;
}

// API Slice
export const walletApiSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    // ─── Wallets ─────────────────────────────────────────────────────────────
    // https://qlozet-backend.fly.dev/api-docs#/Wallets

    // Get wallet balance (GET /wallets/balance)
    getWalletBalance: builder.query<ApiResponse<PendingData>, void>({
      query: () => ({
        url: '/wallets/balance',
        method: 'GET',
      }),
      providesTags: ['WalletBalance'],
    }),

    // Fund wallet via Paystack (POST /wallets/fund)
    fundWallet: builder.mutation<
      ApiResponse<FundWalletResponseData>,
      { amount: number; callback_url?: string }
    >({
      query: (body) => ({
        url: '/wallets/fund',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['WalletBalance', 'Transaction'],
    }),

    // Verify a Paystack payment and credit the wallet
    // (GET /wallets/verify/{reference})
    verifyWalletPayment: builder.query<ApiResponse<PendingData>, string>({
      query: (reference) => ({
        url: `/wallets/verify/${reference}`,
        method: 'GET',
      }),
      providesTags: ['WalletBalance', 'Transaction'],
    }),

    // Withdraw available earnings to the vendor's registered payout account
    // (POST /wallets/withdraw). Amount-only body; refreshes balance +
    // transactions on success.
    withdrawEarnings: builder.mutation<
      ApiResponse<PendingData>,
      WithdrawEarningsRequest
    >({
      query: (body) => ({
        url: '/wallets/withdraw',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['WalletBalance', 'Transaction'],
    }),

    // ─── Payout account ──────────────────────────────────────────────────────

    // List supported banks (GET /wallets/banks)
    getBanks: builder.query<ApiResponse<Bank[]>, string | void>({
      query: (currency) => ({
        url: `/wallets/banks${currency ? `?currency=${currency}` : ''}`,
        method: 'GET',
      }),
      providesTags: ['Bank'],
    }),

    // Current linked payout account (GET /wallets/payout-account)
    getPayoutAccount: builder.query<ApiResponse<PayoutAccount>, void>({
      query: () => ({
        url: '/wallets/payout-account',
        method: 'GET',
      }),
      providesTags: ['PayoutAccount'],
    }),

    // Resolve an account name before linking (POST /wallets/payout-account/resolve)
    resolvePayoutAccount: builder.mutation<
      ApiResponse<ResolvedAccount>,
      ResolveAccountRequest
    >({
      query: (body) => ({
        url: '/wallets/payout-account/resolve',
        method: 'POST',
        body,
      }),
    }),

    // Link/replace the payout account (POST /wallets/payout-account)
    linkPayoutAccount: builder.mutation<
      ApiResponse<{ recipient_code: string; account: PayoutAccount }>,
      LinkPayoutAccountRequest
    >({
      query: (body) => ({
        url: '/wallets/payout-account',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['PayoutAccount'],
    }),

    // Get token price quote (GET /wallets/price?tokens=&currency=)
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
          url: `/wallets/price?${search.toString()}`,
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
  }),
});

// Export hooks
export const {
  useGetWalletBalanceQuery,
  useFundWalletMutation,
  useWithdrawEarningsMutation,
  useGetBanksQuery,
  useGetPayoutAccountQuery,
  useResolvePayoutAccountMutation,
  useLinkPayoutAccountMutation,
  useGetWalletPriceQuery,
  useGetWalletTransactionsQuery,
  useVerifyWalletPaymentQuery,
  useLazyVerifyWalletPaymentQuery,
} = walletApiSlice;

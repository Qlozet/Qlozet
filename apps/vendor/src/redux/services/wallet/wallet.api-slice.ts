// Wallet API Slice
// RTK Query service for wallet-related API operations

import { baseAPI } from '@/redux/api/base-api';

// API Response Types
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface WalletBalance {
  balance: number;
  currency: string;
  pendingBalance?: number;
}

interface Transaction {
  id: string;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  status: 'pending' | 'completed' | 'failed';
  date: string;
  reference?: string;
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
    // Get wallet balance (backend: GET /wallets/balance)
    getWalletBalance: builder.query<ApiResponse<WalletBalance>, void>({
      query: () => ({
        url: '/wallets/balance',
        method: 'GET',
      }),
      providesTags: ['WalletBalance'],
    }),

    // Fund wallet via Paystack (backend: POST /wallets/fund)
    fundWallet: builder.mutation<ApiResponse<unknown>, { amount: number }>({
      query: (body) => ({
        url: '/wallets/fund',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['WalletBalance', 'Transaction'],
    }),

    // Get token price quote (backend: GET /wallets/price)
    getWalletPrice: builder.query<
      ApiResponse<{ price: number; currency: string; tokens: number }>,
      { tokens: number; currency: string }
    >({
      query: ({ tokens, currency }) => ({
        url: `/wallets/price?tokens=${tokens}&currency=${currency}`,
        method: 'GET',
      }),
    }),

    // Get wallet transactions
    getWalletTransactions: builder.query<ApiResponse<Transaction[]>, void>({
      query: () => ({
        url: '/vendor/wallet/transactions',
        method: 'GET',
      }),
      providesTags: ['Transaction'],
    }),

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
  useGetBanksQuery,
  useLazyVerifyAccountNumberQuery,
  useGetBeneficiariesQuery,
  useCreateBeneficiaryMutation,
  useTransferMoneyMutation,
} = walletApiSlice;

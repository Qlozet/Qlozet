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

interface Beneficiary {
  id: string;
  name: string;
  accountNumber: string;
  bankName: string;
  bankCode: string;
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
    // Get wallet balance
    getWalletBalance: builder.query<ApiResponse<WalletBalance>, void>({
      query: () => ({
        url: '/vendor/wallet/balance',
        method: 'GET',
      }),
      providesTags: ['WalletBalance'],
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
  useGetWalletTransactionsQuery,
  useGetBanksQuery,
  useLazyVerifyAccountNumberQuery,
  useGetBeneficiariesQuery,
  useCreateBeneficiaryMutation,
  useTransferMoneyMutation,
} = walletApiSlice;

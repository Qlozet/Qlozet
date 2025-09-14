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
  lastUpdated: string;
}

interface TransactionItem {
  transactionId: string;
  amount: string;
  date: string;
  narration: string;
  status: string;
  transactionType: string;
  createdAt: string;
  recipient?: string;
  reference?: string;
}

interface BankInfo {
  code: string;
  name: string;
  slug: string;
  logo?: string;
}

interface TransferRequest {
  accountNumber: string;
  bankCode: string;
  amount: number;
  narration: string;
  recipientName?: string;
}

interface BeneficiaryItem {
  id: string;
  accountNumber: string;
  bankCode: string;
  bankName: string;
  accountName: string;
  nickname?: string;
  createdAt: string;
}

interface FundWalletRequest {
  amount: number;
  paymentMethod: 'card' | 'bank_transfer' | 'ussd';
  callbackUrl?: string;
}

// API Slice
export const walletApiSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    // Get wallet balance
    getWalletBalance: builder.query<number, void>({
      query: () => ({
        url: '/vendor/wallet/balance',
        method: 'GET'
      }),
      providesTags: ['WalletBalance'],
    }),

    // Get transactions
    getTransactions: builder.query<TransactionItem[], {
      page?: number;
      limit?: number;
      status?: string;
      type?: string;
      startDate?: string;
      endDate?: string;
    }>({
      query: ({ page = 1, limit = 50, status, type, startDate, endDate } = {}) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });
        if (status) params.append('status', status);
        if (type) params.append('type', type);
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        return {
          url: `/vendor/wallet/transactions?${params.toString()}`,
          method: 'GET'
        };
      },
      transformResponse: (response: any) => {
        if (response?.data?.data) {
          return response.data.data.map((item: any) => ({
            transactionId: item?.transactionId,
            amount: `₦${parseInt(item?.amount).toLocaleString()}`,
            date: item?.date,
            narration: item.narration,
            status: item.status, // Will be processed by helper function
            transactionType: item.transType,
            createdAt: item.createdAt,
            recipient: item.recipient,
            reference: item.reference,
          }));
        }
        return [];
      },
      providesTags: ['Transaction']
    }),

    // Get all banks
    getBanks: builder.query<BankInfo[], void>({
      query: () => ({
        url: '/vendor/transfer/banks',
        method: 'GET'
      }),
      providesTags: ['Bank'],
    }),

    // Get total amount received
    getTotalAmountReceived: builder.query<number, string>({
      query: (vendorId) => ({
        url: `/vendor/wallet/${vendorId}/totalReceived`,
        method: 'GET'
      }),
      providesTags: ['WalletStats'],
    }),

    // Send money/transfer
    sendMoney: builder.mutation<ApiResponse<any>, TransferRequest>({
      query: (transferData) => ({
        url: '/vendor/wallet/transfer',
        method: 'POST',
        body: transferData,
      }),
      invalidatesTags: ['WalletBalance', 'Transaction'],
    }),

    // Fund wallet
    fundWallet: builder.mutation<ApiResponse<{ paymentUrl?: string; reference: string }>, FundWalletRequest>({
      query: (fundingData) => ({
        url: '/vendor/wallet/fund',
        method: 'POST',
        body: fundingData,
      }),
      invalidatesTags: ['WalletBalance', 'Transaction'],
    }),

    // Verify account number
    verifyAccountNumber: builder.mutation<ApiResponse<{ accountName: string }>, {
      accountNumber: string;
      bankCode: string;
    }>({
      query: ({ accountNumber, bankCode }) => ({
        url: '/vendor/transfer/verify-account',
        method: 'POST',
        body: { accountNumber, bankCode },
      }),
    }),

    // Get beneficiaries
    getBeneficiaries: builder.query<BeneficiaryItem[], void>({
      query: () => ({
        url: '/vendor/wallet/beneficiaries',
        method: 'GET'
      }),
      providesTags: ['Beneficiary']
    }),

    // Add beneficiary
    addBeneficiary: builder.mutation<ApiResponse<BeneficiaryItem>, {
      accountNumber: string;
      bankCode: string;
      bankName: string;
      accountName: string;
      nickname?: string;
    }>({
      query: (beneficiaryData) => ({
        url: '/vendor/wallet/beneficiaries',
        method: 'POST',
        body: beneficiaryData,
      }),
      invalidatesTags: ['Beneficiary'],
    }),

    // Delete beneficiary
    deleteBeneficiary: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/vendor/wallet/beneficiaries/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Beneficiary'],
    }),

    // Get transaction details
    getTransactionDetails: builder.query<TransactionItem, string>({
      query: (transactionId) => ({
        url: `/vendor/wallet/transactions/${transactionId}`,
        method: 'GET'
      }),
      providesTags: ['Transaction'],
    }),

    // Get wallet statistics
    getWalletStats: builder.query<{
      totalReceived: number;
      totalSent: number;
      totalTransactions: number;
      pendingTransactions: number;
    }, { period?: string }>({
      query: ({ period = 'thisMonth' } = {}) => ({
        url: `/vendor/wallet/stats?period=${period}`,
        method: 'GET'
      }),
      providesTags: ['WalletStats'],
    }),
  }),
});

// Export hooks
export const {
  useGetWalletBalanceQuery,
  useGetTransactionsQuery,
  useGetBanksQuery,
  useGetTotalAmountReceivedQuery,
  useSendMoneyMutation,
  useFundWalletMutation,
  useVerifyAccountNumberMutation,
  useGetBeneficiariesQuery,
  useAddBeneficiaryMutation,
  useDeleteBeneficiaryMutation,
  useGetTransactionDetailsQuery,
  useGetWalletStatsQuery,
} = walletApiSlice;
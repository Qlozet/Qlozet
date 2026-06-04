// Transactions API Slice
// RTK Query service for admin read access to transactions (per vendor/customer).

import { baseAPI } from '@/redux/api/base-api';
import { ApiResponse, PaginatedData, buildQueryString } from '../types';

export interface Transaction {
  _id: string;
  reference?: string;
  amount?: number;
  currency?: string;
  type?: string;
  status?: string;
  business_id?: string;
  customer_id?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface GetTransactionsParams {
  status: string;
  size?: number;
  page?: number;
}

// API Slice
export const transactionsApiSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    // GET /transactions/vendor — paginated transactions by business
    getVendorTransactions: builder.query<
      ApiResponse<PaginatedData<Transaction>>,
      GetTransactionsParams
    >({
      query: (params) => ({
        url: `/transactions/vendor${buildQueryString({ ...params })}`,
        method: 'GET',
      }),
      providesTags: ['Transactions'],
    }),

    // GET /transactions/customer — paginated transactions by customer
    getCustomerTransactions: builder.query<
      ApiResponse<PaginatedData<Transaction>>,
      GetTransactionsParams
    >({
      query: (params) => ({
        url: `/transactions/customer${buildQueryString({ ...params })}`,
        method: 'GET',
      }),
      providesTags: ['Transactions'],
    }),

    // GET /transactions/reference/{reference} — single transaction
    getTransactionByReference: builder.query<ApiResponse<Transaction>, string>({
      query: (reference) => ({
        url: `/transactions/reference/${reference}`,
        method: 'GET',
      }),
      providesTags: ['Transaction'],
    }),
  }),
});

// Export hooks
export const {
  useGetVendorTransactionsQuery,
  useGetCustomerTransactionsQuery,
  useGetTransactionByReferenceQuery,
} = transactionsApiSlice;

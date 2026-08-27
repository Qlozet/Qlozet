// Customers API Slice
// RTK Query service for admin customer management

import { baseAPI } from '@/redux/api/base-api';
import { ApiResponse, PaginatedData, buildQueryString } from '../types';
import type { Transaction } from '../transactions/transactions.api-slice';

/** Whole-collection figures for the customers page's four stat cards. */
export interface CustomerSummary {
  total_customers: number;
  /** Customers who have actually ordered, as opposed to registered accounts. */
  unique_customers: number;
  /** Busiest shipping state, by distinct customers. Null when nothing shipped. */
  top_location: { label: string; customers: number } | null;
  /** Most-ordered product by units. Null when nothing has been bought. */
  favourite_product: { name: string | null; units: number } | null;
  changes: {
    period_days: number;
    total_customers: number | null;
    unique_customers: number | null;
  };
}

/** The saved profile address; `location` is this flattened by the backend. */
export interface CustomerAddress {
  state?: string | null;
  city?: string | null;
  [key: string]: unknown;
}

export interface Customer {
  _id: string;
  /** What the User schema defines and the endpoint sends. */
  full_name?: string | null;
  name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  username?: string | null;
  email?: string | null;
  phone?: string | null;
  phone_number?: string | null;
  gender?: string | null;
  state?: string | null;
  city?: string | null;
  status?: string | null;
  // Avatar (the backend uses a few different field names).
  avatar?: string | null;
  image?: string | null;
  profile_picture?: string | null;
  /** A string on the list rows; the detail endpoint sends `{ state, city }`. */
  address?: string | CustomerAddress | null;
  location?: string | null;
  // Aggregate metrics surfaced in the Customers table / detail view (optional —
  // present only when the backend joins them in).
  /** Joined onto each row by GET /admin/customer. */
  total_orders?: number | null;
  last_order_at?: string | null;
  totalOrders?: number;
  ordersCount?: number;
  lastOrderDate?: string;
  lastOrderAt?: string;
  lastLoggedIn?: string;
  lastLoginAt?: string;
  reviewsCount?: number;
  followedVendorsCount?: number;
  reservedFabricCount?: number;
  createdAt?: string | null;
  updatedAt?: string | null;
  [key: string]: unknown;
}

/**
 * GET /admin/customer/:id.
 *
 * snake_case throughout, like every other endpoint in this backend — the admin
 * app spent a week broken on camelCase guesses, so the spelling here is the
 * contract, not a preference.
 *
 * Every count and money figure is a number the moment the data supports one,
 * including 0. `null` means there is no source for the value at all, which is
 * the only case that may render as a dash.
 */
export interface CustomerDetail extends Customer {
  _id: string;
  full_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  username?: string | null;
  email?: string | null;
  phone?: string | null;
  gender?: string | null;
  status?: string | null;
  profile_picture?: string | null;
  address?: CustomerAddress | null;
  /** "Ikeja, Lagos" — built from the address; null when neither part is set. */
  location?: string | null;
  created_at?: string | null;
  last_login_at?: string | null;
  total_orders?: number | null;
  last_order_at?: string | null;
  reviews_count?: number | null;
  followed_vendors?: number | null;
  reserved_fabrics?: number | null;
  wallet_balance?: number | null;
  pending_balance?: number | null;
  token_balance?: number | null;
  total_returns?: number | null;
  lifetime_spending?: number | null;
}

export interface GetCustomersParams {
  page?: number;
  size?: number;
  search?: string;
  state?: string;
  city?: string;
  gender?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface GetCustomerTransactionsParams {
  customerId: string;
  page?: number;
  size?: number;
}

// API Slice
export const customersApiSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    // Fetch customers with filters
    getCustomers: builder.query<
      ApiResponse<PaginatedData<Customer>>,
      GetCustomersParams | void
    >({
      query: (params) => ({
        url: `/admin/customer${buildQueryString({ ...(params ?? {}) })}`,
        method: 'GET',
      }),
      providesTags: ['Customers'],
    }),

    // One customer, with the profile, activity and wallet figures the detail
    // page shows. Before this endpoint existed the page pulled the list at
    // size:200 and scanned it for a matching _id, which lost every customer
    // past the 200th and none of the wallet figures.
    getCustomer: builder.query<ApiResponse<CustomerDetail>, string>({
      query: (customerId) => ({
        url: `/admin/customer/${customerId}`,
        method: 'GET',
      }),
      providesTags: ['Customer'],
    }),

    // This customer's transactions, paginated. Rows keep the shape the
    // transaction service already returns.
    getCustomerTransactions: builder.query<
      ApiResponse<PaginatedData<Transaction>>,
      GetCustomerTransactionsParams
    >({
      query: ({ customerId, page, size }) => ({
        url: `/admin/customer/${customerId}/transactions${buildQueryString({
          page,
          size,
        })}`,
        method: 'GET',
      }),
      providesTags: ['Transactions'],
    }),

    // Set a customer's account state. Sign-in requires 'active', so both
    // 'inactive' and 'suspended' lock them out — the difference is intent.
    setCustomerStatus: builder.mutation<
      ApiResponse<Customer>,
      { customerId: string; status: 'active' | 'inactive' | 'suspended' }
    >({
      query: ({ customerId, status }) => ({
        url: `/admin/customer/${customerId}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Customers', 'Customer'],
    }),

    // Permanent. The endpoint refuses with a 409 when the customer has orders,
    // and the message says to suspend instead.
    deleteCustomer: builder.mutation<
      ApiResponse<{ deleted: boolean; id: string }>,
      string
    >({
      query: (customerId) => ({
        url: `/admin/customer/${customerId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Customers'],
    }),
  }),
});

// Export hooks
export const {
  useGetCustomersQuery,
  useGetCustomerQuery,
  useGetCustomerTransactionsQuery,
  useSetCustomerStatusMutation,
  useDeleteCustomerMutation,
} = customersApiSlice;

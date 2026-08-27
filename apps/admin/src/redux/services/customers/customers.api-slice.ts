// Customers API Slice
// RTK Query service for admin customer management

import { baseAPI } from '@/redux/api/base-api';
import { ApiResponse, PaginatedData, buildQueryString } from '../types';

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

export interface Customer {
  _id: string;
  /** What the User schema defines and the endpoint sends. */
  full_name?: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  email?: string;
  phone?: string;
  phone_number?: string;
  gender?: string;
  state?: string;
  city?: string;
  status?: string;
  // Avatar (the backend uses a few different field names).
  avatar?: string;
  image?: string;
  profile_picture?: string;
  address?: string;
  location?: string;
  // Aggregate metrics surfaced in the Customers table / detail view (optional —
  // present only when the backend joins them in).
  /** Joined onto each row by GET /admin/customer. */
  total_orders?: number;
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
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
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
  useSetCustomerStatusMutation,
  useDeleteCustomerMutation,
} = customersApiSlice;

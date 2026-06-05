// Customers API Slice
// RTK Query service for admin customer management

import { baseAPI } from '@/redux/api/base-api';
import { ApiResponse, PaginatedData, buildQueryString } from '../types';

export interface Customer {
  _id: string;
  name?: string;
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
  }),
});

// Export hooks
export const { useGetCustomersQuery } = customersApiSlice;

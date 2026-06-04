// Customers API Slice
// RTK Query service for admin customer management

import { baseAPI } from '@/redux/api/base-api';
import { ApiResponse, PaginatedData, buildQueryString } from '../types';

export interface Customer {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
  gender?: string;
  state?: string;
  city?: string;
  status?: string;
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

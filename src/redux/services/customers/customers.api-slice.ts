// Customers API Service - RTK Query
// Handles all customer-related API operations

import { baseAPI } from '@/redux/api/base-api';

// Types
export interface Customer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  orders?: string[];
  totalSpent?: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface CustomersResponse {
  data: Customer[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

export interface CustomerLocationData {
  location: string;
  customerCount: number;
  percentage: number;
}

export interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  newCustomersThisMonth: number;
  topLocations: CustomerLocationData[];
}

export interface CreateCustomerRequest {
  name: string;
  email: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
}

export interface UpdateCustomerRequest extends Partial<CreateCustomerRequest> {
  _id: string;
  status?: 'active' | 'inactive';
}

// API Slice
export const customersApiSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    // Get all customers with pagination
    getCustomers: builder.query<
      CustomersResponse,
      {
        page?: number;
        limit?: number;
        search?: string;
        status?: 'active' | 'inactive' | 'all';
        sortBy?: 'name' | 'email' | 'createdAt' | 'totalSpent';
        sortOrder?: 'asc' | 'desc';
      }
    >({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            searchParams.append(key, value.toString());
          }
        });
        return {
          url: `/vendor/customers?${searchParams.toString()}`,
          method: 'GET',
        };
      },
      providesTags: ['Customer'],
    }),

    // Get single customer
    getCustomer: builder.query<{ data: Customer }, string>({
      query: (customerId) => ({
        url: `/vendor/customers/${customerId}`,
        method: 'GET',
      }),
      providesTags: ['Customer'],
    }),

    // Create customer
    createCustomer: builder.mutation<{ data: Customer }, CreateCustomerRequest>(
      {
        query: (customerData) => ({
          url: '/vendor/customers',
          method: 'POST',
          body: customerData,
        }),
        invalidatesTags: ['Customer', 'CustomerStats'],
      }
    ),

    // Update customer
    updateCustomer: builder.mutation<{ data: Customer }, UpdateCustomerRequest>(
      {
        query: ({ _id, ...customerData }) => ({
          url: `/vendor/customers/${_id}`,
          method: 'PATCH',
          body: customerData,
        }),
        invalidatesTags: ['Customer', 'CustomerStats'],
      }
    ),

    // Delete customer
    deleteCustomer: builder.mutation<{ message: string }, string>({
      query: (customerId) => ({
        url: `/vendor/customers/${customerId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Customer', 'CustomerStats'],
    }),

    // Get customer statistics
    getCustomerStats: builder.query<{ data: CustomerStats }, void>({
      query: () => ({
        url: '/vendor/customers/stats',
        method: 'GET',
      }),
      providesTags: ['CustomerStats'],
    }),

    // Get total customers count
    getTotalCustomers: builder.query<{ data: { totalCount: number } }, void>({
      query: () => ({
        url: '/vendor/customers/total-customers-sold-to',
        method: 'GET',
      }),
      providesTags: ['CustomerStats'],
    }),

    // Get customers by location
    getCustomersByLocation: builder.query<
      {
        data: {
          totalCount: number;
          locations: CustomerLocationData[];
        };
      },
      void
    >({
      query: () => ({
        url: '/vendor/customers/highest-customers-by-location',
        method: 'GET',
      }),
      providesTags: ['CustomerStats'],
    }),

    // Import customers from file
    importCustomers: builder.mutation<
      {
        data: {
          imported: number;
          failed: number;
          errors?: string[];
        };
      },
      FormData
    >({
      query: (formData) => ({
        url: '/vendor/customers/import',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Customer', 'CustomerStats'],
    }),

    // Export customers
    exportCustomers: builder.mutation<
      Blob,
      {
        format: 'csv' | 'xlsx';
        filters?: {
          status?: 'active' | 'inactive' | 'all';
          dateRange?: {
            startDate: string;
            endDate: string;
          };
        };
      }
    >({
      query: ({ format, filters = {} }) => {
        const searchParams = new URLSearchParams();
        searchParams.append('format', format);
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            if (typeof value === 'object') {
              searchParams.append(key, JSON.stringify(value));
            } else {
              searchParams.append(key, value.toString());
            }
          }
        });
        return {
          url: `/vendor/customers/export?${searchParams.toString()}`,
          method: 'POST',
          responseHandler: (response) => response.blob(),
        };
      },
    }),
  }),
});

// Export hooks
export const {
  useGetCustomersQuery,
  useGetCustomerQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
  useGetCustomerStatsQuery,
  useGetTotalCustomersQuery,
  useGetCustomersByLocationQuery,
  useImportCustomersMutation,
  useExportCustomersMutation,
} = customersApiSlice;

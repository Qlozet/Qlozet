// Dashboard API Slice
// RTK Query service for dashboard-related API operations

import { baseAPI } from '@/redux/api/base-api';

// API Response Types
interface LocationData {
  location: string;
  female: number;
  male: number;
}

interface ProductData {
  name: string; // Product name, not location
  female: number;
  male: number;
}

interface GenderByOrderData {
  male: number;
  female: number;
}

interface DailyData {
  date: string;
  amount?: number;
  count?: number;
  [key: string]: any;
}

// API Response interfaces for better type safety
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface CustomerResponse {
  totalCount: number;
}

interface OrderResponse {
  data: Array<{
    id: string;
    status: string;
    [key: string]: any;
  }>;
}

interface EarningsResponse {
  data: {
    earnings: number;
  };
}

// API Slice
export const dashboardApiSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    // Get total customers count
    getTotalCustomers: builder.query<ApiResponse<{ totalCount: number }>, void>(
      {
        query: () => ({
          url: '/vendor/customers/total-customers-sold-to',
          method: 'GET',
        }),
        providesTags: ['DashboardMetrics'],
      }
    ),

    // Get all orders
    getOrders: builder.query<
      ApiResponse<{
        data: Array<{ id: string; status: string; [key: string]: any }>;
      }>,
      void
    >({
      query: () => ({
        url: '/vendor/orders',
        method: 'GET',
      }),
      providesTags: ['DashboardMetrics'],
    }),

    // Get total earnings
    getTotalEarnings: builder.query<
      ApiResponse<{ data: { earnings: number } }>,
      void
    >({
      query: () => ({
        url: '/vendor/dashboard/earnings',
        method: 'GET',
      }),
      providesTags: ['DashboardMetrics'],
    }),

    // Get gender by order data
    getGenderByOrder: builder.query<
      ApiResponse<{ data: GenderByOrderData }>,
      void
    >({
      query: () => ({
        url: '/vendor/dashboard/orders/tag',
        method: 'GET',
      }),
      providesTags: ['DashboardAnalytics'],
    }),

    // Get top locations
    getTopLocations: builder.query<any, void>({
      query: () => ({
        url: '/vendor/dashboard/orders/top-locations',
        method: 'GET',
      }),
      providesTags: ['DashboardAnalytics'],
    }),

    // Get top products
    getTopProducts: builder.query<any, void>({
      query: () => ({
        url: '/vendor/dashboard/orders/top-products',
        method: 'GET',
      }),
      providesTags: ['DashboardAnalytics'],
    }),

    // Get daily earnings
    getDailyEarnings: builder.query<
      ApiResponse<{ data: DailyData[] }>,
      { filter?: string }
    >({
      query: ({ filter = 'thisMonth' } = {}) => ({
        url: `/vendor/dashboard/daily-earnings?filter=${filter}`,
        method: 'GET',
      }),
      providesTags: ['DashboardAnalytics'],
    }),

    // Get daily orders
    getDailyOrders: builder.query<
      ApiResponse<{ data: DailyData[] }>,
      { filter?: string }
    >({
      query: ({ filter = 'thisMonth' } = {}) => ({
        url: `/vendor/orders/daily-order?filter=${filter}`,
        method: 'GET',
      }),
      providesTags: ['DashboardAnalytics'],
    }),
  }),
});

// Export hooks
export const {
  useGetTotalCustomersQuery,
  useGetOrdersQuery,
  useGetTotalEarningsQuery,
  useGetGenderByOrderQuery,
  useGetTopLocationsQuery,
  useGetTopProductsQuery,
  useGetDailyEarningsQuery,
  useGetDailyOrdersQuery,
} = dashboardApiSlice;

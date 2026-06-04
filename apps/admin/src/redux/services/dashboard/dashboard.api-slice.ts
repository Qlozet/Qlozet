// Dashboard API Slice
// RTK Query service for admin dashboard-related API operations

import { baseAPI } from '@/redux/api/base-api';
import { ApiResponse } from '../types';

// Admin overview metrics (shape is permissive; backend response is untyped in swagger)
export interface AdminDashboardMetrics {
  totalVendors?: number;
  verifiedVendors?: number;
  totalCustomers?: number;
  totalOrders?: number;
  grossSales?: number;
  measurementAccuracy?: number;
  [key: string]: unknown;
}

export interface VendorDashboardMetrics {
  [key: string]: unknown;
}

export interface VendorOrder {
  id?: string;
  status?: string;
  [key: string]: unknown;
}

// API Slice
export const dashboardApiSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    // Get admin dashboard metrics
    getAdminDashboard: builder.query<ApiResponse<AdminDashboardMetrics>, void>({
      query: () => ({
        url: '/admin/dashboard',
        method: 'GET',
      }),
      providesTags: ['DashboardMetrics'],
    }),

    // Get vendor/business dashboard metrics for a single business
    getVendorDashboard: builder.query<
      ApiResponse<VendorDashboardMetrics>,
      { businessId: string }
    >({
      query: ({ businessId }) => ({
        url: `/admin/vendor/dashboard?businessId=${businessId}`,
        method: 'GET',
      }),
      providesTags: ['VendorDashboard'],
    }),

    // Get vendor/business orders, optionally filtered by status
    getVendorOrders: builder.query<
      ApiResponse<VendorOrder[]>,
      { status?: string } | void
    >({
      query: (args) => {
        const status = args && 'status' in args ? args.status : undefined;
        return {
          url: status
            ? `/admin/vendor/orders?status=${status}`
            : '/admin/vendor/orders',
          method: 'GET',
        };
      },
      providesTags: ['VendorOrders'],
    }),
  }),
});

// Export hooks
export const {
  useGetAdminDashboardQuery,
  useGetVendorDashboardQuery,
  useGetVendorOrdersQuery,
} = dashboardApiSlice;

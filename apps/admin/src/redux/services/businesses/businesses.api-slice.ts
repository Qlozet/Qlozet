// Businesses API Slice
// RTK Query service for admin business/vendor management.
// In the admin app a "vendor" is a registered business, so this slice backs
// both the Vendors list page and the per-vendor detail view.

import { baseAPI } from '@/redux/api/base-api';
import {
  ApiResponse,
  PaginatedData,
  buildQueryString,
} from '../types';

export type BusinessStatus =
  | 'pending'
  | 'in-review'
  | 'approved'
  | 'verified'
  | 'rejected'
  | 'active'
  | 'inactive'
  | 'suspended';

export interface Business {
  _id: string;
  // Business identity (the backend uses a few different field names depending
  // on whether the record is a business profile or the owning vendor user).
  name?: string;
  business_name?: string;
  business_email?: string;
  email?: string;
  phone?: string;
  phone_number?: string;
  business_phone_number?: string;
  personal_name?: string;
  full_name?: string;
  logo?: string;
  profile_picture?: string;
  status?: BusinessStatus;
  isVerified?: boolean;
  // Aggregate metrics surfaced in the Vendors table (optional — present only
  // when the backend joins them in).
  productsCount?: number;
  ordersCount?: number;
  revenue?: number;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface GetBusinessesParams {
  page?: number;
  size?: number;
  search?: string;
  status?: string;
}

// API Slice
export const businessesApiSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    // Get all registered businesses/vendors (paginated, optionally filtered)
    getBusinesses: builder.query<
      ApiResponse<PaginatedData<Business>>,
      GetBusinessesParams | void
    >({
      query: (params) => ({
        url: `/admin/businesses${buildQueryString({ ...(params ?? {}) })}`,
        method: 'GET',
      }),
      providesTags: ['Businesses'],
    }),

    // Get a single business/vendor by ID
    getBusiness: builder.query<ApiResponse<Business>, string>({
      query: (id) => ({
        url: `/admin/businesses/${id}`,
        method: 'GET',
      }),
      providesTags: ['Business'],
    }),

    // Approve a business
    approveBusiness: builder.mutation<ApiResponse<Business>, string>({
      query: (id) => ({
        url: `/admin/${id}/approve`,
        method: 'POST',
      }),
      invalidatesTags: ['Business', 'Businesses'],
    }),

    // Verify a business (final verification step)
    verifyBusiness: builder.mutation<ApiResponse<Business>, string>({
      query: (id) => ({
        url: `/admin/${id}/verify`,
        method: 'POST',
      }),
      invalidatesTags: ['Business', 'Businesses'],
    }),

    // Reject a business
    rejectBusiness: builder.mutation<ApiResponse<Business>, string>({
      query: (id) => ({
        url: `/admin/${id}/reject`,
        method: 'POST',
      }),
      invalidatesTags: ['Business', 'Businesses'],
    }),

    // Set a business to in-review
    setBusinessInReview: builder.mutation<ApiResponse<Business>, string>({
      query: (id) => ({
        url: `/admin/${id}/in-review`,
        method: 'POST',
      }),
      invalidatesTags: ['Business', 'Businesses'],
    }),
  }),
});

// Export hooks
export const {
  useGetBusinessesQuery,
  useGetBusinessQuery,
  useApproveBusinessMutation,
  useVerifyBusinessMutation,
  useRejectBusinessMutation,
  useSetBusinessInReviewMutation,
} = businessesApiSlice;

// Businesses API Slice
// RTK Query service for admin business/vendor management.
// In the admin app a "vendor" is a registered business, so this slice backs
// both the Vendors list page and the per-vendor detail view.

import { baseAPI } from '@/redux/api/base-api';
import { ApiResponse, PaginatedData, buildQueryString } from '../types';

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
  /** Uploaded logo. Often an empty string rather than absent. */
  business_logo_url?: string;
  display_picture_url?: string;
  cover_image_url?: string;
  cover_image?: string;
  banner?: string;
  /** The owning vendor user, joined in by the list endpoint. */
  vendor?: { _id?: string; full_name?: string; email?: string };
  created_by?: { id?: string; name?: string; email?: string };
  status?: BusinessStatus;
  isVerified?: boolean;
  // Aggregate metrics surfaced in the Vendors table (optional — present only
  // when the backend joins them in).
  total_products?: number;
  total_orders?: number;
  total_revenue?: number;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface GetBusinessesParams {
  page?: number;
  size?: number;
  search?: string;
  /** 'active' | 'inactive' | 'pending', or a raw BusinessStatus. */
  status?: string;
  /** Column to order by; the endpoint defaults to 'date'. */
  sort?: 'revenue' | 'products' | 'orders' | 'date' | 'name';
  order?: 'asc' | 'desc';
  /** Date-onboarded range, matched on createdAt. ISO strings. */
  startDate?: string;
  endDate?: string;
}

/** Whole-collection figures for the vendors page's stat cards. */
export interface VendorSummary {
  total_vendors: number;
  active_vendors: number;
  inactive_vendors: number;
  /** Neither active nor inactive — pending and in-review. */
  awaiting_vendors: number;
  changes: {
    period_days: number;
    total_vendors: number | null;
    active_vendors: number | null;
    inactive_vendors: number | null;
  };
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

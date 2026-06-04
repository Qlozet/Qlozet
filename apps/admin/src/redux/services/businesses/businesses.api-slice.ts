// Businesses API Slice
// RTK Query service for admin business/vendor management

import { baseAPI } from '@/redux/api/base-api';
import { ApiResponse, PaginatedData, PaginationParams } from '../types';

export type BusinessStatus =
  | 'pending'
  | 'in-review'
  | 'approved'
  | 'verified'
  | 'rejected';

export interface Business {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
  status?: BusinessStatus;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

// API Slice
export const businessesApiSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    // Get all registered businesses (paginated)
    getBusinesses: builder.query<
      ApiResponse<PaginatedData<Business>>,
      PaginationParams | void
    >({
      query: (args) => {
        const params = new URLSearchParams();
        if (args?.page !== undefined) params.append('page', `${args.page}`);
        if (args?.size !== undefined) params.append('size', `${args.size}`);
        const qs = params.toString();
        return {
          url: qs ? `/admin/businesses?${qs}` : '/admin/businesses',
          method: 'GET',
        };
      },
      providesTags: ['Businesses'],
    }),

    // Get a single business by ID
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

// Vendor API Slice
// RTK Query service for vendor-related API operations

import { baseAPI } from '@/redux/api/base-api';

// API Response Types
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface VendorDetails {
  businessName: string;
  businessAddress: string;
  businessPhoneNumber: string;
  businessEmail: string;
  personalName: string;
  profileImage?: string;
  profilePic?: string;
  averageRating?: string;
  profit?: string;
  items?: string;
  ratings?: string;
}

interface VerificationResponse {
  verified: boolean;
  message: string;
}

// API Slice
export const vendorApiSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    // Get vendor profile details
    getVendorProfile: builder.query<ApiResponse<VendorDetails>, void>({
      query: () => ({
        url: '/vendor/profile',
        method: 'GET',
      }),
      providesTags: ['VendorDetails'],
    }),

    // Verify vendor account
    verifyVendor: builder.query<ApiResponse<VerificationResponse>, string>({
      query: (userId) => ({
        url: `/vendor/verify/${userId}`,
        method: 'GET',
      }),
    }),

    // Update vendor profile
    updateVendorProfile: builder.mutation<
      ApiResponse<VendorDetails>,
      Partial<VendorDetails>
    >({
      query: (data) => ({
        url: '/vendor/profile',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['VendorDetails'],
    }),
  }),
});

// Export hooks
export const {
  useGetVendorProfileQuery,
  useLazyVerifyVendorQuery,
  useUpdateVendorProfileMutation,
} = vendorApiSlice;

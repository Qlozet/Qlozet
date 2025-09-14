// Authentication API Service - RTK Query
// Handles all authentication-related API operations

import { baseAPI } from '@/redux/api/base-api';

// Types
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  data: {
    user: {
      _id: string;
      name: string;
      email: string;
      role: 'vendor' | 'admin' | 'customer';
      profileImage?: string;
      phone?: string;
      isEmailVerified: boolean;
      isActive: boolean;
      lastLogin?: string;
      createdAt: string;
    };
    token: string;
    refreshToken: string;
    expiresIn: number;
  };
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  businessName?: string;
  businessType?: string;
  agreeToTerms: boolean;
}

export interface RegisterResponse {
  data: {
    user: {
      _id: string;
      name: string;
      email: string;
      role: string;
      isEmailVerified: boolean;
    };
    message: string;
  };
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  businessName?: string;
  businessType?: string;
  profileImage?: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// API Slice
export const authApiSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    // Login
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth'],
    }),

    // Register
    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (userData) => ({
        url: '/register',
        method: 'POST',
        body: userData,
      }),
    }),

    // Logout
    logout: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: '/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Auth', 'Profile'],
    }),

    // Forgot Password
    forgotPassword: builder.mutation<{ message: string }, ForgotPasswordRequest>({
      query: (data) => ({
        url: '/forgot-password',
        method: 'POST',
        body: data,
      }),
    }),

    // Reset Password
    resetPassword: builder.mutation<{ message: string }, ResetPasswordRequest>({
      query: (data) => ({
        url: '/reset-password',
        method: 'POST',
        body: data,
      }),
    }),

    // Change Password
    changePassword: builder.mutation<{ message: string }, ChangePasswordRequest>({
      query: (data) => ({
        url: '/change-password',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Profile'],
    }),

    // Verify Email
    verifyEmail: builder.mutation<{ message: string }, VerifyEmailRequest>({
      query: ({ token }) => ({
        url: `/verify-email?token=${token}`,
        method: 'POST',
      }),
      invalidatesTags: ['Auth', 'Profile'],
    }),

    // Resend Verification Email
    resendVerificationEmail: builder.mutation<{ message: string }, { email: string }>({
      query: (data) => ({
        url: '/resend-verification',
        method: 'POST',
        body: data,
      }),
    }),

    // Refresh Token
    refreshToken: builder.mutation<LoginResponse, RefreshTokenRequest>({
      query: (data) => ({
        url: '/refresh-token',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Auth'],
    }),

    // Get Current User Profile
    getProfile: builder.query<{ data: LoginResponse['data']['user'] }, void>({
      query: () => ({
        url: '/profile',
      }),
      providesTags: ['Profile'],
    }),

    // Update Profile
    updateProfile: builder.mutation<{ data: LoginResponse['data']['user'] }, UpdateProfileRequest>({
      query: (data) => ({
        url: '/profile',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Profile'],
    }),

    // Upload Profile Image
    uploadProfileImage: builder.mutation<{ data: { profileImage: string } }, FormData>({
      query: (formData) => ({
        url: '/profile/upload-image',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Profile'],
    }),

    // Delete Account
    deleteAccount: builder.mutation<{ message: string }, { password: string }>({
      query: (data) => ({
        url: '/delete-account',
        method: 'DELETE',
        body: data,
      }),
      invalidatesTags: ['Auth', 'Profile'],
    }),

    // Check Email Availability
    checkEmailAvailability: builder.query<{ available: boolean }, string>({
      query: (email) => `/check-email?email=${encodeURIComponent(email)}`,
    }),

    // Get Two-Factor Authentication Settings
    getTwoFactorSettings: builder.query<{ 
      data: { 
        isEnabled: boolean; 
        backupCodes?: string[]; 
      }
    }, void>({
      query: () => ({
        url: '/2fa/settings',
      }),
      providesTags: ['Profile'],
    }),

    // Enable Two-Factor Authentication
    enableTwoFactor: builder.mutation<{ 
      data: { 
        qrCode: string; 
        secret: string; 
        backupCodes: string[];
      }
    }, void>({
      query: () => ({
        url: '/2fa/enable',
        method: 'POST',
      }),
      invalidatesTags: ['Profile'],
    }),

    // Verify Two-Factor Authentication Setup
    verifyTwoFactorSetup: builder.mutation<{ message: string }, { code: string }>({
      query: (data) => ({
        url: '/2fa/verify-setup',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Profile'],
    }),

    // Disable Two-Factor Authentication
    disableTwoFactor: builder.mutation<{ message: string }, { password: string }>({
      query: (data) => ({
        url: '/2fa/disable',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Profile'],
    }),
  }),
});

// Export hooks
export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useVerifyEmailMutation,
  useResendVerificationEmailMutation,
  useRefreshTokenMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUploadProfileImageMutation,
  useDeleteAccountMutation,
  useCheckEmailAvailabilityQuery,
  useGetTwoFactorSettingsQuery,
  useEnableTwoFactorMutation,
  useVerifyTwoFactorSetupMutation,
  useDisableTwoFactorMutation,
} = authApiSlice;
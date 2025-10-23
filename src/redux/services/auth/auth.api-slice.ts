// Authentication API Service - RTK Query
// Handles all authentication-related API operations

import { baseAPI } from '@/redux/api/base-api';

// Types
export interface LoginRequest {
  businessEmail: string;
  password: string;
  rememberMe?: boolean;
}

// Unified interface for sign-in (covers both email formats)
export interface SignInRequest {
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
  business_name: string,
  business_email: string,
  business_phone_number: string,
  business_address: string,
  personal_name: string,
  personal_email: string,
  personal_phone_number: string,
  national_identity_number: string,
  password: string
}

export interface ForgotPasswordRequest {
  businessEmail?: string;
  email?: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
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
    // Unified Login (handles both email formats)
    signIn: builder.mutation<LoginResponse, SignInRequest>({
      query: ({ email, password }) => ({
        url: '/auth/login/vendor',
        method: 'POST',
        body: {
          email: email,
          password: password
          // ...(credentials.rememberMe && { rememberMe: credentials.rememberMe }),
        },
      }),
      invalidatesTags: ['Auth'],
    }),

    // Legacy Login (keeping for backward compatibility)
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/vendor/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth'],
    }),

    // Register
    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (userData) => ({
        url: '/auth/register/vendor',
        method: 'POST',
        body: userData,
      }),
    }),

    // Forgot Password (vendor endpoint)
    forgotPassword: builder.mutation<
      { message: string; success?: boolean },
      ForgotPasswordRequest
    >({
      query: (data) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body: {
          email: data.businessEmail || data.email,
        },
      }),
    }),

    // Reset Password (vendor endpoint)
    resetPassword: builder.mutation<
      { message: string; success?: boolean },
      ResetPasswordRequest
    >({
      query: (data) => ({
        url: '/vendor/reset-password',
        method: 'POST',
        body: data,
      }),
    }),

    // Logout
    logout: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: '/vendor/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Auth', 'Profile'],
    }),

    // General Forgot Password (fallback endpoint)
    forgotPasswordGeneral: builder.mutation<
      { message: string },
      ForgotPasswordRequest
    >({
      query: (data) => ({
        url: '/forgot-password',
        method: 'POST',
        body: {
          email: data.email || data.businessEmail,
        },
      }),
    }),

    // General Reset Password (fallback endpoint)
    resetPasswordGeneral: builder.mutation<
      { message: string },
      ResetPasswordRequest
    >({
      query: (data) => ({
        url: '/reset-password',
        method: 'POST',
        body: data,
      }),
    }),

    // Change Password
    changePassword: builder.mutation<
      { message: string },
      ChangePasswordRequest
    >({
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
    resendVerificationEmail: builder.mutation<
      { message: string },
      { email: string }
    >({
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
    updateProfile: builder.mutation<
      { data: LoginResponse['data']['user'] },
      UpdateProfileRequest
    >({
      query: (data) => ({
        url: '/profile',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Profile'],
    }),

    // Upload Profile Image
    uploadProfileImage: builder.mutation<
      { data: { profileImage: string } },
      FormData
    >({
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
    getTwoFactorSettings: builder.query<
      {
        data: {
          isEnabled: boolean;
          backupCodes?: string[];
        };
      },
      void
    >({
      query: () => ({
        url: '/2fa/settings',
      }),
      providesTags: ['Profile'],
    }),

    // Enable Two-Factor Authentication
    enableTwoFactor: builder.mutation<
      {
        data: {
          qrCode: string;
          secret: string;
          backupCodes: string[];
        };
      },
      void
    >({
      query: () => ({
        url: '/2fa/enable',
        method: 'POST',
      }),
      invalidatesTags: ['Profile'],
    }),

    // Verify Two-Factor Authentication Setup
    verifyTwoFactorSetup: builder.mutation<
      { message: string },
      { code: string }
    >({
      query: (data) => ({
        url: '/2fa/verify-setup',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Profile'],
    }),

    // Disable Two-Factor Authentication
    disableTwoFactor: builder.mutation<
      { message: string },
      { password: string }
    >({
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
  useSignInMutation,
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useForgotPasswordGeneralMutation,
  useResetPasswordGeneralMutation,
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

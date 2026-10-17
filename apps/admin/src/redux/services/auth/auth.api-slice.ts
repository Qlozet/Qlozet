import { baseAPI } from '@/redux/api/base-api';

interface LoginPayload {
  email: string;
  password: string;
}

interface LoginResponse {
  statusCode: number;
  message: string;
  data: {
    user: {
      _id: string;
      full_name: string;
      email: string;
      role: string;
      type: string;
      status: string;
      business: string;
    };
    token: {
      access_token: string;
      refresh_token: string;
    };
    /** True while the emailed temporary password is still in use. */
    must_change_password?: boolean;
  };
}

interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
}

interface MessageResponse {
  statusCode?: number;
  message: string;
  success?: boolean;
}

// Mirrors PasswordResetRequestDto — `email` only.
interface ForgotPasswordPayload {
  email: string;
}

// Mirrors PasswordResetDto exactly: the reset token from the email plus the
// new password. The field is `newPassword`, NOT `password` — sending the wrong
// key fails the backend's validation.
interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

const authAPI = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    adminLogin: builder.mutation<LoginResponse, LoginPayload>({
      query: (credentials) => ({
        url: '/auth/login/platform',
        method: 'POST',
        body: credentials,
      }),
    }),

    // Emails a password reset token to the address, if an account exists.
    forgotPassword: builder.mutation<MessageResponse, ForgotPasswordPayload>({
      query: (body) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body,
      }),
    }),

    // Completes the reset using the token from that email.
    changePassword: builder.mutation<MessageResponse, ChangePasswordPayload>({
      query: (body) => ({
        url: '/auth/change-password',
        method: 'POST',
        body,
      }),
      // Clears must_change_password on the access read.
      invalidatesTags: ['CurrentUser'],
    }),

    resetPassword: builder.mutation<MessageResponse, ResetPasswordPayload>({
      query: (body) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useAdminLoginMutation,
  useChangePasswordMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authAPI;

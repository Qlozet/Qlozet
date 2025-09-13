import { baseAPI } from "@/redux/api/base-api";

// These interfaces are examples
interface IPayload {
  email: string;
}
interface IResponse {
  email: string;
  password: string;
}

interface IOtpVerificationPayload {
  code: string;
  email: string;
}

export interface IOtpVerificationResponse {
  uid: string;
  token: string;
}

interface IResetPasswordPayload {
  uid: string;
  token: string;
  new_password: string;
}

const resetPasswordApiSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    // Sends Reset OTP
    sendResetPasswordOTP: builder.mutation<IResponse, IPayload>({
      query: (DTO) => ({
        url: "users/reset_password/",
        method: "POST",
        body: DTO,
      }),
    }),

    // Verifies Reset password OTP
    verifyResetPasswordOTP: builder.mutation<IOtpVerificationResponse, IOtpVerificationPayload>({
      query: (DTO) => ({
        url: "users/password/reset/verify/",
        method: "POST",
        body: DTO,
      }),
    }),

    // Reset password
    resetPassword: builder.mutation<IOtpVerificationResponse, IResetPasswordPayload>({
      query: (DTO) => ({
        url: "users/reset_password_confirm/",
        method: "POST",
        body: DTO,
      }),
    }),
  }),
});

export const { useSendResetPasswordOTPMutation, useVerifyResetPasswordOTPMutation, useResetPasswordMutation } = resetPasswordApiSlice;

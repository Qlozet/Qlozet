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
  };
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
  }),
  overrideExisting: false,
});

export const { useAdminLoginMutation } = authAPI;

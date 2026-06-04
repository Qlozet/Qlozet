// Settings API Slice
// RTK Query service for admin platform settings & token price

import { baseAPI } from '@/redux/api/base-api';
import { ApiResponse } from '../types';

export type PayoutCycle = 'weekly' | 'bi-weekly' | 'monthly';

export interface PlatformSettings {
  payout_cycle?: PayoutCycle;
  minimum_payout?: number;
  payout_delay_days?: number;
  tailored_order_upfront?: number;
  platform_commission_percent?: number;
  payment_handling_fee_percent?: number;
  payment_handling_fee_flat?: number;
  [key: string]: unknown;
}

export type UpdatePlatformSettingsRequest = Partial<PlatformSettings>;

// API Slice
export const settingsApiSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    // Get current platform settings
    getPlatformSettings: builder.query<ApiResponse<PlatformSettings>, void>({
      query: () => ({
        url: '/admin/settings',
        method: 'GET',
      }),
      providesTags: ['PlatformSettings'],
    }),

    // Update platform settings
    updatePlatformSettings: builder.mutation<
      ApiResponse<PlatformSettings>,
      UpdatePlatformSettingsRequest
    >({
      query: (body) => ({
        url: '/admin/settings',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['PlatformSettings'],
    }),

    // Update platform token price
    refreshTokenPrice: builder.mutation<ApiResponse<unknown>, void>({
      query: () => ({
        url: '/admin/refresh-token-price',
        method: 'POST',
      }),
      invalidatesTags: ['TokenPrice'],
    }),
  }),
});

// Export hooks
export const {
  useGetPlatformSettingsQuery,
  useUpdatePlatformSettingsMutation,
  useRefreshTokenPriceMutation,
} = settingsApiSlice;

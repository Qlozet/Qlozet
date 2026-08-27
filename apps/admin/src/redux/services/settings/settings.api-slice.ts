// Settings API Slice
// RTK Query service for admin platform settings & token price.
//
// The shapes below mirror the backend's PlatformSettings schema
// (qlozet-backend/src/modules/platform/schema/platformSettings.schema.ts) and
// were checked field-for-field against the deployed spec at
// /api-docs-json: `UpdatePlatformSettingsDto` documents these same 27 fields,
// `token_price` included.
//
// Names have to match the schema exactly. PlatformService.update() hands the
// body straight to `findOneAndUpdate`, so a key the schema does not know is
// dropped by Mongoose's strict mode and the call still answers 200 — a typo
// here saves nothing and reports success.

import { baseAPI } from '@/redux/api/base-api';
import { ApiResponse } from '../types';

export type PayoutCycle = 'weekly' | 'bi-weekly' | 'monthly';

/** Commission is either a percentage of the item price or a flat naira amount. */
export type CommissionType = 'percent' | 'fixed';

export interface TokenPrice {
  /** Set by an administrator — the price of one token in USD. */
  usd: { amount: number; currency: string };
  /**
   * Derived, not entered: a 3AM cron (and POST /admin/refresh-token-price)
   * converts `usd.amount` at the day's FX rate and rounds to whole kobo.
   */
  ngn: { amount: number; currency: string; last_updated?: string };
}

export interface PlatformSettings {
  _id?: string;

  // Payouts
  payout_cycle: PayoutCycle;
  minimum_payout: number;
  payout_delay_days: number;
  auto_release_days: number;
  tailored_order_upfront_percent: number;
  reservation_fee_percent: number;

  // Commission, fees and tax
  platform_commission_type: CommissionType;
  platform_commission_percent: number;
  platform_commission_flat: number;
  payment_handling_fee_percent: number;
  payment_handling_fee_flat: number;
  tax_percent: number;

  // Order lifecycle
  auto_reject_hours: number;
  return_window_days: number;
  late_penalty_percent_per_day: number;
  late_penalty_max_percent: number;

  // Availability
  low_stock_threshold: number;
  low_fabric_yards: number;

  // AI + tokens
  token_price: TokenPrice;
  image_measurement_token_price: number;
  video_measurement_token_price: number;
  outfit_generation_token_price: number;
  edit_garment_token_price: number;
  run_prediction_token_price: number;
  ai_ask_token_price: number;
  analyze_reference_token_price: number;
  ai_ask_requires_auth: boolean;

  createdAt?: string;
  updatedAt?: string;
}

/**
 * PATCH is a partial update, so only the fields an administrator actually
 * changed need to travel.
 *
 * `token_price` is the exception: Mongoose `$set`s a nested object wholesale,
 * so sending `{ token_price: { usd } }` would wipe the NGN half. Send the
 * complete object whenever the USD price changes.
 */
export type UpdatePlatformSettingsRequest = Partial<PlatformSettings>;

export const settingsApiSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    // Current platform settings. The backend seeds a document on first read,
    // so this never 404s on a fresh environment.
    getPlatformSettings: builder.query<ApiResponse<PlatformSettings>, void>({
      query: () => ({
        url: '/admin/settings',
        method: 'GET',
      }),
      providesTags: ['PlatformSettings'],
    }),

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

    // Re-converts the USD token price at today's rate. It writes to the same
    // settings document, so the whole form has to be re-read afterwards.
    refreshTokenPrice: builder.mutation<ApiResponse<TokenPrice>, void>({
      query: () => ({
        url: '/admin/refresh-token-price',
        method: 'POST',
      }),
      invalidatesTags: ['TokenPrice', 'PlatformSettings'],
    }),
  }),
});

export const {
  useGetPlatformSettingsQuery,
  useUpdatePlatformSettingsMutation,
  useRefreshTokenPriceMutation,
} = settingsApiSlice;

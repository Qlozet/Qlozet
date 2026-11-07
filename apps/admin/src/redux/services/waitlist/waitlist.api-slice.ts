// Waitlist API Slice
// The pre-launch waitlist (backend GET /admin/waitlist): staff only, a
// customers page in the permission grid since it is contact details.

import { baseAPI } from '@/redux/api/base-api';
import { ApiResponse, buildQueryString } from '../types';

export type WaitlistType = 'customer' | 'vendor';

export interface WaitlistEntry {
  type: WaitlistType;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  businessName: string | null;
  businessType: string | null;
  createdAt: string | null;
  /** They have since made an account of the same type with this email. */
  signed_up: boolean;
  /** Random-letter name or a dotted-up email (backend waitlist-bot.ts). */
  likely_bot?: boolean;
}

export interface WaitlistPage {
  data: WaitlistEntry[];
  page: number;
  size: number;
  total_items: number;
  has_next_page: boolean;
  /** The whole list, not the current filter. Counts people; bots apart. */
  totals: {
    total: number;
    customers: number;
    vendors: number;
    this_week: number;
    likely_bots: number;
  };
}

export interface WaitlistParams {
  type?: 'all' | WaitlistType;
  search?: string;
  /** 'people' (default) hides likely bots; 'bots' shows only them. */
  show?: 'people' | 'bots';
  page?: number;
  size?: number;
}

export const waitlistApiSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    getWaitlist: builder.query<WaitlistPage, WaitlistParams>({
      query: (params) => ({
        url: `/admin/waitlist${buildQueryString({ ...params })}`,
        method: 'GET',
      }),
      transformResponse: (res: ApiResponse<WaitlistPage>) => res.data,
      providesTags: ['Waitlist'],
    }),

    // Deletes every likely-bot entry; needs Customers → Delete.
    deleteWaitlistBots: builder.mutation<{ deleted: number }, void>({
      query: () => ({ url: '/admin/waitlist/bots', method: 'DELETE' }),
      transformResponse: (res: ApiResponse<{ deleted: number }>) => res.data,
      invalidatesTags: ['Waitlist'],
    }),

    // The same filter as a CSV file; the page turns the text into a download.
    exportWaitlist: builder.query<
      string,
      Pick<WaitlistParams, 'type' | 'search' | 'show'>
    >({
      query: (params) => ({
        url: `/admin/waitlist/export${buildQueryString({ ...params })}`,
        method: 'GET',
        responseHandler: 'text',
      }),
      keepUnusedDataFor: 0,
    }),
  }),
});

export const {
  useGetWaitlistQuery,
  useLazyExportWaitlistQuery,
  useDeleteWaitlistBotsMutation,
} = waitlistApiSlice;

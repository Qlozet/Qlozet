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
}

export interface WaitlistPage {
  data: WaitlistEntry[];
  page: number;
  size: number;
  total_items: number;
  has_next_page: boolean;
  /** The whole list, not the current filter. */
  totals: {
    total: number;
    customers: number;
    vendors: number;
    this_week: number;
  };
}

export interface WaitlistParams {
  type?: 'all' | WaitlistType;
  search?: string;
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
    }),

    // The same filter as a CSV file; the page turns the text into a download.
    exportWaitlist: builder.query<
      string,
      Pick<WaitlistParams, 'type' | 'search'>
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

export const { useGetWaitlistQuery, useLazyExportWaitlistQuery } =
  waitlistApiSlice;

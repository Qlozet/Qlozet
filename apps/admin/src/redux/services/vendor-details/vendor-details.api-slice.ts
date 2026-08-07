// Vendor Details API Slice
// RTK Query endpoints backing the admin "vendor details" page tables.
// The Qlozet backend is permissive/untyped for these read surfaces, so the
// shapes below are intentionally loose and the UI falls back to placeholders
// when a field is absent.

import { baseAPI } from '@/redux/api/base-api';
import { ApiResponse, PaginatedData, buildQueryString } from '../types';

export interface VendorProduct {
  _id: string;
  name?: string;
  images?: string[];
  price?: number;
  category?: string;
  tag?: string;
  tags?: string[];
  stock?: number;
  variants?: unknown[];
  status?: string;
  [key: string]: unknown;
}

export interface VendorActivity {
  _id: string;
  date?: string;
  createdAt?: string;
  user?: string;
  activityType?: string;
  type?: string;
  description?: string;
  amount?: number;
  status?: string;
  remarks?: string;
  [key: string]: unknown;
}

export interface VendorComplaint {
  _id: string;
  reference?: string;
  ticket_id?: string;
  title?: string;
  subject?: string;
  description?: string;
  message?: string;
  date?: string;
  createdAt?: string;
  status?: string;
  [key: string]: unknown;
}

export interface VendorTableParams {
  businessId: string;
  page?: number;
  size?: number;
  status?: string;
  search?: string;
}

export const vendorDetailsApiSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    // Products belonging to a vendor (Top Products table)
    getVendorProducts: builder.query<
      ApiResponse<PaginatedData<VendorProduct>>,
      VendorTableParams
    >({
      query: ({ businessId, page, size }) => ({
        url: `/products/by-vendor${buildQueryString({ businessId, page, size })}`,
        method: 'GET',
      }),
      providesTags: ['Products'],
    }),

    // Wallet activity / transactions for a vendor (Activity Log table)
    getVendorActivityLog: builder.query<
      ApiResponse<PaginatedData<VendorActivity>>,
      VendorTableParams
    >({
      query: ({ businessId, page, size, status }) => ({
        url: `/transactions/vendor${buildQueryString({
          businessId,
          page,
          size,
          status: status ?? 'all',
        })}`,
        method: 'GET',
      }),
      providesTags: ['Transactions'],
    }),

    // Complaints / tickets raised against a vendor (Complaint table)
    getVendorComplaints: builder.query<
      ApiResponse<PaginatedData<VendorComplaint>>,
      VendorTableParams
    >({
      // TODO(api): /admin/tickets has no business/vendor filter — its params
      // are search, status, assigned_to, start_date, end_date, page, size. The
      // best available scoping is a text search for the business id, so results
      // are at worst empty; they are never another vendor's.
      //
      // `search ?? businessId` used to leave this UNSCOPED: the caller passes
      // '' for an empty search box, and `??` only catches null/undefined, so an
      // empty string went through, buildQueryString dropped it, and the request
      // returned EVERY ticket on the platform under one vendor's page.
      query: ({ businessId, page, size }) => ({
        url: `/admin/tickets${buildQueryString({
          search: businessId,
          page,
          size,
        })}`,
        method: 'GET',
      }),
      providesTags: ['Tickets'],
    }),
  }),
});

export const {
  useGetVendorProductsQuery,
  useGetVendorActivityLogQuery,
  useGetVendorComplaintsQuery,
} = vendorDetailsApiSlice;

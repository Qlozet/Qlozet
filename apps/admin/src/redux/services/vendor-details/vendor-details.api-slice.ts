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
  /** Owning business id — the only reliable way to scope tickets to a vendor. */
  business?: string;
  issue_type?: string;
  description?: string;
  createdAt?: string;
  status?: string;
  [key: string]: unknown;
}

/** The `{ chartType, title, series }` bundle GET /admin/businesses/:id/chart returns. */
export interface VendorChart {
  summary?: {
    totalOrders?: number;
    totalOrdersChange?: string;
    totalEarnings?: number;
    totalEarningsChange?: string;
    averageOrdersPerDay?: number;
    averageOrdersChange?: string;
    totalReturns?: number;
    totalReturnsChange?: string;
  };
  charts?: Record<
    string,
    {
      chartType?: string;
      title?: string;
      series?: {
        key?: string;
        name?: string;
        color?: string;
        data?: { label: string; value: number }[];
      }[];
    }
  >;
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
    // Vendor wallet ledger (Activity Log table).
    //
    // /transactions/vendor cannot serve this: it derives the business from the
    // caller's own token, so an admin calling it dereferenced an absent
    // business and got a 500. This route takes the id in the path.
    getVendorTransactions: builder.query<
      ApiResponse<PaginatedData<VendorActivity>>,
      VendorTableParams
    >({
      query: ({ businessId, ...params }) => ({
        url: `/admin/businesses/${businessId}/transactions${buildQueryString(params)}`,
        method: 'GET',
      }),
      providesTags: ['Transactions'],
    }),

    // Vendor charts — the same bundle the vendor app reads at /orders/chart,
    // scoped to the business in the path rather than the caller's token.
    getVendorChart: builder.query<ApiResponse<VendorChart>, string>({
      query: (businessId) => ({
        url: `/admin/businesses/${businessId}/chart`,
        method: 'GET',
      }),
      providesTags: ['VendorDashboard'],
    }),

    // Products belonging to a vendor (Top Products table)
    //
    // NOT /products/by-vendor: that endpoint takes no business id at all (its
    // params are kind/page/size) and resolves the vendor from the caller's own
    // JWT, so an admin — who has no business on their session — gets
    // "Vendor business ID is missing from your session".
    //
    // The filter param is `business_id`, not `businessId`. An unrecognised
    // param is silently ignored rather than rejected, so the camelCase spelling
    // returned every product on the platform under one vendor's heading.
    getVendorProducts: builder.query<
      ApiResponse<PaginatedData<VendorProduct>>,
      VendorTableParams
    >({
      query: ({ businessId, page, size, search }) => ({
        url: `/products${buildQueryString({
          business_id: businessId,
          page,
          size,
          search: search || undefined,
        })}`,
        method: 'GET',
      }),
      providesTags: ['Products'],
    }),

    // Wallet activity / transactions for a vendor (Activity Log table)
    //
    // TODO(api): there is no admin-visible endpoint for another vendor's
    // transactions. `/transactions/vendor` is session-scoped exactly like
    // /products/by-vendor and fails with "Cannot read properties of undefined
    // (reading 'toString')" when the caller has no business. Kept pointing at
    // it so the table surfaces a real error instead of silently showing
    // somebody else's ledger; it needs a backend endpoint to work.
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
      // /admin/tickets has no business filter — its params are search, status,
      // assigned_to, start_date, end_date, page, size — but every ticket does
      // carry a `business` id, so the scoping is done here instead.
      //
      // The previous approach passed the business id as `search`, which can
      // never match: search compares against `description` and `issue_type`
      // only, so the table was always empty. A page is fetched and filtered by
      // the real field instead.
      query: () => ({
        url: `/admin/tickets${buildQueryString({ page: 1, size: 200 })}`,
        method: 'GET',
      }),
      transformResponse: (
        response: ApiResponse<PaginatedData<VendorComplaint>>,
        _meta,
        arg: VendorTableParams
      ) => {
        const all = response?.data?.data ?? [];
        const mine = all.filter(
          (ticket) => String(ticket.business ?? '') === String(arg.businessId)
        );
        return {
          ...response,
          data: { ...response.data, data: mine, total_items: mine.length },
        };
      },
      providesTags: ['Tickets'],
    }),
  }),
});

export const {
  useGetVendorProductsQuery,
  useGetVendorActivityLogQuery,
  useGetVendorComplaintsQuery,
  useGetVendorTransactionsQuery,
  useGetVendorChartQuery,
} = vendorDetailsApiSlice;

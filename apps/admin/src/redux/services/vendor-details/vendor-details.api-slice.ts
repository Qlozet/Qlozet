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

// Mirrors the Warehouse schema. This previously declared city/state/country
// and is_active — none of which the API sends, so the address line was always
// bare and the status was always absent.
export interface VendorWarehouse {
  _id: string;
  name?: string;
  address?: string;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  status?: 'active' | 'inactive';
  [key: string]: unknown;
}

/** Fields an admin may edit on a vendor. Mirrors AdminUpdateBusinessDto. */
export interface AdminVendorUpdate {
  business_name?: string;
  business_email?: string;
  business_phone_number?: string;
  description?: string;
  website?: string;
  year_founded?: string;
  business_logo_url?: string;
  business_logo_svg_url?: string;
  cover_image_url?: string;
  /** Replaces the whole stored list, which is how the API treats it. */
  cac_document_url?: string[];
  business_address?: string;
  city?: string;
  state?: string;
  country?: string;
  zip_code?: string;
  payout_bank_name?: string;
  payout_account_number?: string;
  payout_account_name?: string;
}

export type VendorNoteKind = 'note' | 'flag';

export interface VendorNote {
  _id: string;
  body: string;
  kind: VendorNoteKind;
  resolved: boolean;
  author?: { _id?: string; full_name?: string; email?: string };
  resolved_by?: { _id?: string; full_name?: string; email?: string } | null;
  resolved_at?: string | null;
  createdAt?: string;
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

    // A vendor's warehouses. /business/warehouse is scoped to the caller, so
    // the console could only show a count with nothing behind it.
    getVendorWarehouses: builder.query<
      ApiResponse<PaginatedData<VendorWarehouse>>,
      VendorTableParams
    >({
      query: ({ businessId, ...params }) => ({
        url: `/admin/businesses/${businessId}/warehouses${buildQueryString(params)}`,
        method: 'GET',
      }),
      providesTags: ['Business'],
    }),

    // Edit another business's profile. PATCH /business/profile only ever
    // updates the caller's own, so an admin had no way to correct a record.
    updateVendorProfile: builder.mutation<
      ApiResponse<unknown>,
      { businessId: string; patch: AdminVendorUpdate }
    >({
      query: ({ businessId, patch }) => ({
        url: `/admin/businesses/${businessId}`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: ['Business', 'Businesses'],
    }),

    // Internal notes and flags. Never shown to the vendor.
    getVendorNotes: builder.query<
      ApiResponse<PaginatedData<VendorNote>>,
      VendorTableParams
    >({
      query: ({ businessId, ...params }) => ({
        url: `/admin/businesses/${businessId}/notes${buildQueryString(params)}`,
        method: 'GET',
      }),
      providesTags: ['VendorNotes'],
    }),

    addVendorNote: builder.mutation<
      ApiResponse<VendorNote>,
      { businessId: string; body: string; kind?: VendorNoteKind }
    >({
      query: ({ businessId, ...payload }) => ({
        url: `/admin/businesses/${businessId}/notes`,
        method: 'POST',
        body: payload,
      }),
      // A flag also flips the vendor's is_flagged, so the record and the list
      // both go stale.
      invalidatesTags: ['VendorNotes', 'Business', 'Businesses'],
    }),

    resolveVendorNote: builder.mutation<ApiResponse<VendorNote>, string>({
      query: (noteId) => ({
        url: `/admin/vendor-notes/${noteId}/resolve`,
        method: 'PATCH',
      }),
      invalidatesTags: ['VendorNotes', 'Business', 'Businesses'],
    }),

    deleteVendorNote: builder.mutation<ApiResponse<unknown>, string>({
      query: (noteId) => ({
        url: `/admin/vendor-notes/${noteId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['VendorNotes', 'Business', 'Businesses'],
    }),

    // Raises a support ticket against the vendor — the console already has a
    // queue and a detail screen for tickets.
    escalateVendor: builder.mutation<
      ApiResponse<{ _id?: string }>,
      { businessId: string; issue_type: string; description: string }
    >({
      query: ({ businessId, ...payload }) => ({
        url: `/admin/businesses/${businessId}/escalate`,
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['Tickets'],
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
  useGetVendorWarehousesQuery,
  useUpdateVendorProfileMutation,
  useGetVendorNotesQuery,
  useAddVendorNoteMutation,
  useResolveVendorNoteMutation,
  useDeleteVendorNoteMutation,
  useEscalateVendorMutation,
} = vendorDetailsApiSlice;

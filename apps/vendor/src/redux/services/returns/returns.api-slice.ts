// Returns API Slice
// RTK Query service for the Qlozet "Returns" domain (vendor side).
// The /returns response shapes are not documented in Swagger yet, so types are
// kept permissive and read tolerantly in the UI (see the tickets/wallet slices
// for the same approach).

import { baseAPI } from '@/redux/api/base-api';
import { ApiResponse, PaginatedData, buildQueryString } from '../types';

// A single return request. Lifecycle: pending -> approved -> received -> refunded
// (or rejected). Field names are best-effort guesses; the UI reads them
// defensively.
export interface ReturnRequest {
  _id: string;
  order_id?: string;
  order_reference?: string;
  item_index?: number;
  reason?: string;
  /** pending | approved | rejected | received | refunded */
  status?: string;
  refund_amount?: number;
  customer?: {
    _id?: string;
    username?: string;
    email?: string;
    [key: string]: unknown;
  };
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface GetVendorReturnsParams {
  search?: string;
  status?: string;
  page?: number;
  size?: number;
}

// ---- API Slice ----
export const returnsApiSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    // GET /returns/vendor — paginated returns raised against this vendor's orders
    getVendorReturns: builder.query<
      ApiResponse<PaginatedData<ReturnRequest>>,
      GetVendorReturnsParams | void
    >({
      query: (params) => ({
        url: `/returns/vendor${buildQueryString({ ...(params ?? {}) })}`,
        method: 'GET',
      }),
      providesTags: ['Returns'],
    }),

    // PATCH /returns/:id/approve — accept the return
    approveReturn: builder.mutation<ApiResponse<ReturnRequest>, string>({
      query: (id) => ({ url: `/returns/${id}/approve`, method: 'PATCH' }),
      invalidatesTags: ['Returns', 'Return'],
    }),

    // PATCH /returns/:id/reject — decline the return (optional reason)
    rejectReturn: builder.mutation<
      ApiResponse<ReturnRequest>,
      { id: string; reason?: string }
    >({
      query: ({ id, reason }) => ({
        url: `/returns/${id}/reject`,
        method: 'PATCH',
        body: reason ? { reason } : undefined,
      }),
      invalidatesTags: ['Returns', 'Return'],
    }),

    // PATCH /returns/:id/received — mark the item received; triggers auto-refund,
    // so the wallet balance can change too.
    markReturnReceived: builder.mutation<ApiResponse<ReturnRequest>, string>({
      query: (id) => ({ url: `/returns/${id}/received`, method: 'PATCH' }),
      invalidatesTags: ['Returns', 'Return', 'WalletBalance'],
    }),
  }),
});

export const {
  useGetVendorReturnsQuery,
  useApproveReturnMutation,
  useRejectReturnMutation,
  useMarkReturnReceivedMutation,
} = returnsApiSlice;
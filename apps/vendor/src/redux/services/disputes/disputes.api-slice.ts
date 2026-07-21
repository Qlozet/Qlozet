// Disputes API Slice
// RTK Query service for the Qlozet "Disputes" domain (vendor side).
// The /disputes response shapes are not documented in Swagger yet, so types are
// kept permissive and read tolerantly in the UI.

import { baseAPI } from '@/redux/api/base-api';
import { ApiResponse, PaginatedData, buildQueryString } from '../types';

// A single dispute raised by a customer against an order. While a dispute is
// open the order's vendor earnings are frozen. Lifecycle (best effort):
// open -> under_review -> vendor_responded -> resolved | rejected | refunded.
export interface Dispute {
  _id: string;
  order_id?: string;
  order_reference?: string;
  reason?: string;
  description?: string;
  status?: string;
  evidence_urls?: string[];
  vendor_response?: string;
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

export interface GetVendorDisputesParams {
  search?: string;
  status?: string;
  page?: number;
  size?: number;
}

export interface RespondDisputeRequest {
  id: string;
  vendor_response: string;
  evidence_urls?: string[];
}

// ---- API Slice ----
export const disputesApiSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    // GET /disputes/vendor — paginated disputes against this vendor's orders
    getVendorDisputes: builder.query<
      ApiResponse<PaginatedData<Dispute>>,
      GetVendorDisputesParams | void
    >({
      query: (params) => ({
        url: `/disputes/vendor${buildQueryString({ ...(params ?? {}) })}`,
        method: 'GET',
      }),
      providesTags: ['Disputes'],
    }),

    // PATCH /disputes/:id/respond — vendor's counter-response + evidence
    respondToDispute: builder.mutation<
      ApiResponse<Dispute>,
      RespondDisputeRequest
    >({
      query: ({ id, ...body }) => ({
        url: `/disputes/${id}/respond`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Disputes', 'Dispute'],
    }),
  }),
});

export const {
  useGetVendorDisputesQuery,
  useRespondToDisputeMutation,
} = disputesApiSlice;
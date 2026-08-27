// Disputes API Slice
// RTK Query service for the admin Disputes page.
//
// Backend (Disputes module):
//   GET   /disputes/admin?status=   — list all disputes (ADMIN)
//   PATCH /disputes/:id/resolve     — resolve a dispute (ADMIN)
// A dispute is customer-filed against a vendor for a delivered order; the admin
// arbitrates the outcome (full refund / partial refund / release to vendor).

import { baseAPI } from '@/redux/api/base-api';

export type DisputeStatus =
  | 'open'
  | 'under_review'
  | 'resolved_refund'
  | 'resolved_partial'
  | 'resolved_released'
  | 'closed';

export type DisputeReason =
  | 'wrong_item'
  | 'damaged'
  | 'not_as_described'
  | 'poor_quality'
  | 'missing_items'
  | 'measurement_issue'
  | 'other';

export type DisputeResolution =
  | 'full_refund'
  | 'partial_refund'
  | 'release_to_vendor';

export interface DisputeBusinessRef {
  _id: string;
  business_name?: string;
  logo?: string;
}

export interface DisputeCustomerRef {
  _id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
}

export interface Dispute {
  _id: string;
  order: string;
  order_reference: string;
  customer: DisputeCustomerRef | string;
  business: DisputeBusinessRef | string;
  reason: DisputeReason;
  description: string;
  evidence_urls: string[];
  initiated_by?: 'customer' | 'vendor';
  status: DisputeStatus;
  vendor_response?: string | null;
  vendor_evidence_urls?: string[];
  admin_notes?: string | null;
  refund_amount?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ResolveDisputeRequest {
  id: string;
  resolution: DisputeResolution;
  refund_amount?: number;
  admin_notes?: string;
}

/** Unwrap the CustomResponseInterceptor envelope ({ data }) or a bare array. */
function unwrapList(response: unknown): Dispute[] {
  if (Array.isArray(response)) return response as Dispute[];
  if (response && typeof response === 'object') {
    const inner = (response as { data?: unknown }).data;
    if (Array.isArray(inner)) return inner as Dispute[];
    if (inner !== undefined) return unwrapList(inner);
  }
  return [];
}

export const disputesApiSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    getAdminDisputes: builder.query<Dispute[], { status?: string } | void>({
      query: (params) => {
        const status = params?.status;
        return {
          url: status
            ? `/disputes/admin?status=${encodeURIComponent(status)}`
            : '/disputes/admin',
          method: 'GET',
        };
      },
      transformResponse: unwrapList,
      providesTags: ['Disputes'],
    }),

    resolveDispute: builder.mutation<unknown, ResolveDisputeRequest>({
      query: ({ id, ...body }) => ({
        url: `/disputes/${id}/resolve`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Disputes', 'Dispute'],
    }),
  }),
});

export const { useGetAdminDisputesQuery, useResolveDisputeMutation } =
  disputesApiSlice;

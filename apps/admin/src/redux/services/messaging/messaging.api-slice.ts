// Admin messaging (read-only)
// The bespoke order chat between a customer and a tailor. Admin can read a
// thread for oversight / dispute evidence but never participates.
//   GET /admin/orders/:reference/messages   (ADMIN)

import { baseAPI } from '@/redux/api/base-api';

export interface OrderMessage {
  _id: string;
  order_reference: string;
  sender: string;
  sender_role: 'customer' | 'vendor' | 'admin';
  content: string;
  createdAt?: string;
  created_at?: string;
}

function unwrap(response: unknown): OrderMessage[] {
  if (Array.isArray(response)) return response as OrderMessage[];
  if (response && typeof response === 'object') {
    const inner = (response as { data?: unknown }).data;
    if (Array.isArray(inner)) return inner as OrderMessage[];
  }
  return [];
}

export const adminMessagingApiSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    getAdminOrderMessages: builder.query<OrderMessage[], string>({
      query: (reference) => ({
        url: `/admin/orders/${reference}/messages`,
        method: 'GET',
      }),
      transformResponse: unwrap,
      providesTags: (_res, _err, reference) => [
        { type: 'OrderMessages', id: reference },
      ],
    }),
  }),
});

export const { useGetAdminOrderMessagesQuery } = adminMessagingApiSlice;

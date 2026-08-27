// Messaging API Slice
// Bespoke order chat between the tailor (vendor) and the customer.
//   GET  /orders/:reference/messages
//   POST /orders/:reference/messages   { content }
// Live delivery is handled separately over Socket.IO (order-message event);
// these REST endpoints are history + send.

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

// The response interceptor wraps the service's `{ data: ... }` return inside its
// own `data`, so the array sits a couple of `.data` levels deep. Recurse down.
function unwrap(response: unknown): OrderMessage[] {
  if (Array.isArray(response)) return response as OrderMessage[];
  if (response && typeof response === 'object' && 'data' in response) {
    return unwrap((response as { data: unknown }).data);
  }
  return [];
}

export const messagingApiSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    getOrderMessages: builder.query<OrderMessage[], string>({
      query: (reference) => ({
        url: `/orders/${reference}/messages`,
        method: 'GET',
      }),
      transformResponse: unwrap,
      providesTags: (_res, _err, reference) => [
        { type: 'OrderMessages', id: reference },
      ],
    }),
    sendOrderMessage: builder.mutation<
      OrderMessage,
      { reference: string; content: string }
    >({
      query: ({ reference, content }) => ({
        url: `/orders/${reference}/messages`,
        method: 'POST',
        body: { content },
      }),
      transformResponse: (r: any) => r?.data ?? r,
      invalidatesTags: (_res, _err, { reference }) => [
        { type: 'OrderMessages', id: reference },
      ],
    }),
  }),
});

export const { useGetOrderMessagesQuery, useSendOrderMessageMutation } =
  messagingApiSlice;

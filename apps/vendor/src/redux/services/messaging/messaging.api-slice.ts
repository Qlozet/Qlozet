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

// Unread counts, total and keyed by order reference. One request serves both
// the header badge and the per-row badges on the orders table.
export interface UnreadMessageCounts {
  total: number;
  per_order: Record<string, number>;
}

function unwrapCounts(response: unknown): UnreadMessageCounts {
  let node: any = response;
  // Same envelope problem as unwrap() above, but the payload is an object, so
  // recurse only while the thing we want is still nested.
  for (let i = 0; i < 4; i += 1) {
    if (node && typeof node === 'object' && 'total' in node) break;
    if (node && typeof node === 'object' && 'data' in node) node = node.data;
    else break;
  }
  return {
    total: typeof node?.total === 'number' ? node.total : 0,
    per_order:
      node?.per_order && typeof node.per_order === 'object'
        ? node.per_order
        : {},
  };
}

export const messagingApiSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    getUnreadMessageCounts: builder.query<UnreadMessageCounts, void>({
      query: () => ({ url: '/orders/messages/unread', method: 'GET' }),
      transformResponse: unwrapCounts,
      providesTags: [{ type: 'OrderMessages', id: 'UNREAD' }],
    }),
    getOrderMessages: builder.query<OrderMessage[], string>({
      query: (reference) => ({
        url: `/orders/${reference}/messages`,
        method: 'GET',
      }),
      transformResponse: unwrap,
      providesTags: (_res, _err, reference) => [
        { type: 'OrderMessages', id: reference },
      ],
      // Reading a thread marks it read on the server, so the counts are now
      // stale. A query cannot declare invalidatesTags, hence doing it here.
      async onQueryStarted(_reference, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(
            baseAPI.util.invalidateTags([
              { type: 'OrderMessages' as const, id: 'UNREAD' },
            ])
          );
        } catch {
          /* a failed read changes nothing */
        }
      },
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

export const {
  useGetOrderMessagesQuery,
  useSendOrderMessageMutation,
  useGetUnreadMessageCountsQuery,
} = messagingApiSlice;

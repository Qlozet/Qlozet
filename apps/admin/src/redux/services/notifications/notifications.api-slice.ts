// Notifications API Slice
// RTK Query service for the notification feed. Ported from the vendor app —
// `/notifications` is not vendor-scoped in its path, so the admin session reads
// the notifications addressed to the signed-in platform user.

import { baseAPI } from '@/redux/api/base-api';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export type NotificationCategory =
  | 'order'
  | 'shipping'
  | 'payment'
  | 'bespoke'
  | 'product'
  | 'team'
  | 'system';

export interface AppNotification {
  _id: string;
  id?: string;
  recipient: string;
  category: NotificationCategory;
  type: string;
  title: string;
  body: string;
  is_read: boolean;
  metadata?: Record<string, unknown>;
  action_url?: string;
  createdAt: string;
}

export interface NotificationsMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UnreadCountResponse {
  total: number;
  byCategory: Record<string, number>;
}

export type BroadcastAudience = 'customers' | 'vendors' | 'admins';

export type BroadcastStatus =
  | 'scheduled'
  | 'sending'
  | 'sent'
  | 'failed'
  | 'cancelled';

export interface Broadcast {
  _id: string;
  subject: string;
  body: string;
  audience: BroadcastAudience;
  send_email: boolean;
  status: BroadcastStatus;
  scheduled_at: string | null;
  sent_at: string | null;
  created_by_name?: string;
  recipient_count: number;
  emails_sent: number;
  emails_failed: number;
  error: string | null;
  createdAt: string;
}

export interface CreateBroadcastBody {
  subject: string;
  body: string;
  audience: BroadcastAudience;
  send_email: boolean;
  scheduled_at?: string;
}

// The interceptor wraps the service's `{ data }` in its own, so the payload
// sits a couple of levels down. Recurse to the object that has `rows`.
function unwrapBroadcasts(response: unknown): {
  rows: Broadcast[];
  meta?: NotificationsMeta;
} {
  let node: any = response;
  for (let i = 0; i < 4; i += 1) {
    if (node && typeof node === 'object' && Array.isArray(node.rows)) break;
    if (node && typeof node === 'object' && 'data' in node) node = node.data;
    else break;
  }
  return {
    rows: Array.isArray(node?.rows) ? node.rows : [],
    meta: node?.meta,
  };
}

export const notificationsApiSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    // ─── Admin announcements ───────────────────────────────────────────
    getBroadcasts: builder.query<
      { rows: Broadcast[]; meta?: NotificationsMeta },
      { page?: number; limit?: number } | void
    >({
      query: (args) => ({
        url: '/notifications/broadcasts',
        method: 'GET',
        params: {
          page: (args as any)?.page ?? 1,
          limit: (args as any)?.limit ?? 20,
        },
      }),
      transformResponse: unwrapBroadcasts,
      providesTags: ['Broadcast'],
    }),
    createBroadcast: builder.mutation<unknown, CreateBroadcastBody>({
      query: (body) => ({
        url: '/notifications/broadcasts',
        method: 'POST',
        body,
      }),
      // The send runs in the background, so the row's counters only move on a
      // refetch — invalidate both the history and this admin's own bell.
      invalidatesTags: ['Broadcast', 'Notification'],
    }),
    cancelBroadcast: builder.mutation<unknown, string>({
      query: (id) => ({
        url: `/notifications/broadcasts/${id}/cancel`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Broadcast'],
    }),
    // Paginated notifications, optionally filtered by category.
    getNotifications: builder.query<
      ApiResponse<AppNotification[]> & { meta?: NotificationsMeta },
      { page?: number; limit?: number; category?: string } | void
    >({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.set('page', String(params.page));
        if (params?.limit) searchParams.set('limit', String(params.limit));
        if (params?.category) searchParams.set('category', params.category);
        const qs = searchParams.toString();
        return {
          url: `/notifications${qs ? `?${qs}` : ''}`,
          method: 'GET',
        };
      },
      providesTags: ['Notification'],
    }),

    // Unread count (total + per category) — drives the top-bar bell badge.
    getUnreadCount: builder.query<ApiResponse<UnreadCountResponse>, void>({
      query: () => ({
        url: '/notifications/unread-count',
        method: 'GET',
      }),
      providesTags: ['Notification'],
    }),

    markNotificationAsViewed: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Notification'],
    }),

    markAllAsRead: builder.mutation<ApiResponse<null>, void>({
      query: () => ({
        url: '/notifications/mark-all-read',
        method: 'PATCH',
      }),
      invalidatesTags: ['Notification'],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkNotificationAsViewedMutation,
  useMarkAllAsReadMutation,
  useGetBroadcastsQuery,
  useCreateBroadcastMutation,
  useCancelBroadcastMutation,
} = notificationsApiSlice;

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

export const notificationsApiSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
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
} = notificationsApiSlice;

// Notifications API Slice
// RTK Query service for notification-related API operations

import { baseAPI } from '@/redux/api/base-api';

// API Response Types
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface Notification {
  _id: string;
  id?: string;
  recipient: string;
  category: 'order' | 'shipping' | 'payment' | 'bespoke' | 'product' | 'team' | 'system';
  type: string;
  title: string;
  body: string;
  is_read: boolean;
  metadata?: Record<string, any>;
  action_url?: string;
  createdAt: string;
}

interface PaginatedResponse {
  data: Notification[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface UnreadCountResponse {
  total: number;
  byCategory: Record<string, number>;
}

// API Slice
export const notificationsApiSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    // Get paginated notifications with optional category filter
    getNotifications: builder.query<
      ApiResponse<Notification[]> & { meta: PaginatedResponse['meta'] },
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

    // Get unread notification count (total + per category)
    getUnreadCount: builder.query<ApiResponse<UnreadCountResponse>, void>({
      query: () => ({
        url: '/notifications/unread-count',
        method: 'GET',
      }),
      providesTags: ['Notification'],
    }),

    // Mark notification as read
    markNotificationAsViewed: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Notification'],
    }),

    // Mark all notifications as read
    markAllAsRead: builder.mutation<ApiResponse<null>, void>({
      query: () => ({
        url: '/notifications/mark-all-read',
        method: 'PATCH',
      }),
      invalidatesTags: ['Notification'],
    }),
  }),
});

// Export hooks
export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkNotificationAsViewedMutation,
  useMarkAllAsReadMutation,
} = notificationsApiSlice;

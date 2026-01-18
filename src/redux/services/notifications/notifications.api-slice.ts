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
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
}

// API Slice
export const notificationsApiSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    // Get notifications
    getNotifications: builder.query<ApiResponse<Notification[]>, void>({
      query: () => ({
        url: '/vendor/notifications',
        method: 'GET',
      }),
      providesTags: ['Notification'],
    }),

    // Mark notification as viewed
    markNotificationAsViewed: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/vendor/notification/view/${id}`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Notification'],
    }),

    // Mark all notifications as read
    markAllAsRead: builder.mutation<ApiResponse<null>, void>({
      query: () => ({
        url: '/vendor/notifications/mark-all-read',
        method: 'PATCH',
      }),
      invalidatesTags: ['Notification'],
    }),
  }),
});

// Export hooks
export const {
  useGetNotificationsQuery,
  useMarkNotificationAsViewedMutation,
  useMarkAllAsReadMutation,
} = notificationsApiSlice;

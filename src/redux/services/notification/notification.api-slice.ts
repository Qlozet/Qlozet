// Notification API Slice
// RTK Query service for notification-related API operations

import { baseAPI } from '@/redux/api/base-api';

// API Response Types
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface NotificationItem {
  id: string;
  read: boolean;
  title: string;
  description: string;
  createdAt: string;
  updatedAt?: string;
  type?: string;
  priority?: 'low' | 'medium' | 'high';
}

interface NotificationsResponse {
  data: Array<{
    id: string;
    read: boolean;
    title: string;
    description: string;
    createdAt: string;
    updatedAt?: string;
    type?: string;
    priority?: string;
  }>;
  totalCount: number;
  unreadCount: number;
}

// API Slice
export const notificationApiSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    // Get all notifications
    getNotifications: builder.query<NotificationItem[], { page?: number; limit?: number; unreadOnly?: boolean }>({
      query: ({ page = 1, limit = 50, unreadOnly = false } = {}) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });
        if (unreadOnly) params.append('unreadOnly', 'true');
        return `/vendor/notification?${params.toString()}`;
      },
      transformResponse: (response: any) => {
        // Transform the response to match our interface
        if (response?.data?.data) {
          return response.data.data.map((item: any) => ({
            id: item.id,
            read: item.read,
            title: item.title,
            description: item.description || '',
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            type: item.type,
            priority: item.priority || 'medium',
          }));
        }
        return [];
      },
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ id }) => ({ type: 'Notification' as const, id })),
            { type: 'Notification', id: 'LIST' },
          ]
          : [{ type: 'Notification', id: 'LIST' }],
    }),

    // Get notification counts
    getNotificationCounts: builder.query<{ total: number; unread: number }, void>({
      query: () => '/vendor/notification/counts',
      transformResponse: (response: any) => ({
        total: response?.data?.total || 0,
        unread: response?.data?.unread || 0,
      }),
      providesTags: [{ type: 'Notification', id: 'COUNTS' }],
    }),

    // Mark notification as read
    markNotificationAsRead: builder.mutation<ApiResponse<NotificationItem>, string>({
      query: (id) => ({
        url: `/vendor/notification/${id}/read`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Notification', id },
        { type: 'Notification', id: 'LIST' },
        { type: 'Notification', id: 'COUNTS' },
      ],
    }),

    // Mark all notifications as read
    markAllNotificationsAsRead: builder.mutation<ApiResponse<null>, void>({
      query: () => ({
        url: '/vendor/notification/mark-all-read',
        method: 'PUT',
      }),
      invalidatesTags: [
        { type: 'Notification', id: 'LIST' },
        { type: 'Notification', id: 'COUNTS' },
      ],
    }),

    // Delete notification
    deleteNotification: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/vendor/notification/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Notification', id },
        { type: 'Notification', id: 'LIST' },
        { type: 'Notification', id: 'COUNTS' },
      ],
    }),

    // Delete multiple notifications
    deleteMultipleNotifications: builder.mutation<ApiResponse<null>, string[]>({
      query: (ids) => ({
        url: '/vendor/notification/bulk-delete',
        method: 'DELETE',
        body: { ids },
      }),
      invalidatesTags: [
        { type: 'Notification', id: 'LIST' },
        { type: 'Notification', id: 'COUNTS' },
      ],
    }),

    // Get notification settings
    getNotificationSettings: builder.query<{
      emailNotifications: boolean;
      pushNotifications: boolean;
      smsNotifications: boolean;
      categories: string[];
    }, void>({
      query: () => '/vendor/notification/settings',
      transformResponse: (response: any) => response?.data || {
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        categories: [],
      },
    }),

    // Update notification settings
    updateNotificationSettings: builder.mutation<ApiResponse<any>, {
      emailNotifications?: boolean;
      pushNotifications?: boolean;
      smsNotifications?: boolean;
      categories?: string[];
    }>({
      query: (settings) => ({
        url: '/vendor/notification/settings',
        method: 'PUT',
        body: settings,
      }),
    }),
  }),
});

// Export hooks
export const {
  useGetNotificationsQuery,
  useGetNotificationCountsQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
  useDeleteNotificationMutation,
  useDeleteMultipleNotificationsMutation,
  useGetNotificationSettingsQuery,
  useUpdateNotificationSettingsMutation,
} = notificationApiSlice;
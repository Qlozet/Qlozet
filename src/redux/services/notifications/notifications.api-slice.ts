// Notifications API Service - RTK Query
// Handles all notification-related API operations

import { baseAPI } from '@/redux/api/base-api';

// Types
export interface Notification {
  _id: string;
  type: 'order' | 'customer' | 'product' | 'system' | 'payment' | 'shipping' | 'promotion';
  title: string;
  message: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionUrl?: string;
  actionText?: string;
  metadata?: {
    orderId?: string;
    customerId?: string;
    productId?: string;
    amount?: number;
    [key: string]: any;
  };
  createdAt: string;
  readAt?: string;
  expiresAt?: string;
}

export interface NotificationsResponse {
  data: Notification[];
  totalCount: number;
  unreadCount: number;
  currentPage: number;
  totalPages: number;
}

export interface NotificationSettings {
  emailNotifications: {
    newOrders: boolean;
    orderStatusUpdates: boolean;
    paymentAlerts: boolean;
    lowStockAlerts: boolean;
    customerMessages: boolean;
    systemUpdates: boolean;
    promotionalEmails: boolean;
  };
  pushNotifications: {
    newOrders: boolean;
    orderStatusUpdates: boolean;
    paymentAlerts: boolean;
    lowStockAlerts: boolean;
    customerMessages: boolean;
    systemUpdates: boolean;
  };
  smsNotifications: {
    urgentAlerts: boolean;
    paymentFailures: boolean;
    systemDowntime: boolean;
  };
}

export interface CreateNotificationRequest {
  type: Notification['type'];
  title: string;
  message: string;
  priority?: Notification['priority'];
  actionUrl?: string;
  actionText?: string;
  metadata?: Notification['metadata'];
  scheduleFor?: string; // ISO date string for scheduled notifications
  expiresAt?: string; // ISO date string for expiration
}

export interface UpdateNotificationRequest {
  _id: string;
  isRead?: boolean;
  title?: string;
  message?: string;
  priority?: Notification['priority'];
  actionUrl?: string;
  actionText?: string;
}

// API Slice
export const notificationsApiSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    // Get all notifications with pagination and filters
    getNotifications: builder.query<NotificationsResponse, {
      page?: number;
      limit?: number;
      type?: Notification['type'] | 'all';
      isRead?: boolean;
      priority?: Notification['priority'] | 'all';
      dateRange?: {
        startDate: string;
        endDate: string;
      };
      sortBy?: 'createdAt' | 'priority' | 'type';
      sortOrder?: 'asc' | 'desc';
    }>({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            if (typeof value === 'object') {
              searchParams.append(key, JSON.stringify(value));
            } else {
              searchParams.append(key, value.toString());
            }
          }
        });
        return `/vendor/notifications?${searchParams.toString()}`;
      },
      providesTags: ['Notification'],
    }),

    // Get single notification
    getNotification: builder.query<{ data: Notification }, string>({
      query: (notificationId) => ({
        url: `/vendor/notifications/${notificationId}`,
        method: 'GET'
      }),
      providesTags: ['Notification'],
    }),

    // Get unread notifications count
    getUnreadCount: builder.query<{ data: { count: number } }, void>({
      query: () => '/vendor/notifications/unread-count',
      providesTags: ['Notification'],
    }),

    // Create notification (for system/admin use)
    createNotification: builder.mutation<{ data: Notification }, CreateNotificationRequest>({
      query: (notificationData) => ({
        url: '/vendor/notifications',
        method: 'POST',
        body: notificationData,
      }),
      invalidatesTags: ['Notification'],
    }),

    // Update notification (mainly for marking as read/unread)
    updateNotification: builder.mutation<{ data: Notification }, UpdateNotificationRequest>({
      query: ({ _id, ...notificationData }) => ({
        url: `/vendor/notifications/${_id}`,
        method: 'PATCH',
        body: notificationData,
      }),
      invalidatesTags: (result, error, { _id }) => [
        { type: 'Notification', id: _id },
        'Notification'
      ],
    }),

    // Mark notification as read
    markAsRead: builder.mutation<{ data: Notification }, string>({
      query: (notificationId) => ({
        url: `/vendor/notifications/${notificationId}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, notificationId) => [
        { type: 'Notification', id: notificationId },
        'Notification'
      ],
    }),

    // Mark notification as unread
    markAsUnread: builder.mutation<{ data: Notification }, string>({
      query: (notificationId) => ({
        url: `/vendor/notifications/${notificationId}/unread`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Notification'],
    }),

    // Mark all notifications as read
    markAllAsRead: builder.mutation<{ data: { modifiedCount: number } }, {
      type?: Notification['type'];
      olderThan?: string; // ISO date string
    }>({
      query: (params = {}) => ({
        url: '/vendor/notifications/mark-all-read',
        method: 'PATCH',
        body: params,
      }),
      invalidatesTags: ['Notification'],
    }),

    // Delete notification
    deleteNotification: builder.mutation<{ message: string }, string>({
      query: (notificationId) => ({
        url: `/vendor/notifications/${notificationId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Notification']
    }),

    // Bulk delete notifications
    bulkDeleteNotifications: builder.mutation<{
      data: {
        deletedCount: number;
      }
    }, {
      notificationIds: string[];
    }>({
      query: ({ notificationIds }) => ({
        url: '/vendor/notifications/bulk-delete',
        method: 'DELETE',
        body: { notificationIds },
      }),
      invalidatesTags: ['Notification'],
    }),

    // Delete all read notifications
    deleteAllRead: builder.mutation<{ data: { deletedCount: number } }, {
      type?: Notification['type'];
      olderThan?: string; // ISO date string
    }>({
      query: (params = {}) => ({
        url: '/vendor/notifications/delete-all-read',
        method: 'DELETE',
        body: params,
      }),
      invalidatesTags: ['Notification'],
    }),

    // Get notification settings
    getNotificationSettings: builder.query<{ data: NotificationSettings }, void>({
      query: () => ({
        url: '/vendor/notifications/settings',
        method: 'GET'
      }),
      providesTags: ['NotificationSettings'],
    }),

    // Update notification settings
    updateNotificationSettings: builder.mutation<{ data: NotificationSettings }, Partial<NotificationSettings>>({
      query: (settings) => ({
        url: '/vendor/notifications/settings',
        method: 'PATCH',
        body: settings,
      }),
      invalidatesTags: ['NotificationSettings'],
    }),

    // Test notification (for settings testing)
    sendTestNotification: builder.mutation<{ message: string }, {
      type: 'email' | 'push' | 'sms';
      template: string;
    }>({
      query: (data) => ({
        url: '/vendor/notifications/test',
        method: 'POST',
        body: data,
      }),
    }),

    // Get notification templates (for admin/system use)
    getNotificationTemplates: builder.query<{
      data: {
        type: string;
        templates: {
          name: string;
          subject: string;
          content: string;
          variables: string[];
        }[];
      }[]
    }, void>({
      query: () => ({
        url: '/vendor/notifications/templates',
        method: 'GET'
      }),
    }),

    // Subscribe to push notifications
    subscribeToPushNotifications: builder.mutation<{ message: string }, {
      endpoint: string;
      keys: {
        p256dh: string;
        auth: string;
      };
    }>({
      query: (subscriptionData) => ({
        url: '/vendor/notifications/push-subscribe',
        method: 'POST',
        body: subscriptionData,
      }),
      invalidatesTags: ['NotificationSettings'],
    }),

    // Unsubscribe from push notifications
    unsubscribeFromPushNotifications: builder.mutation<{ message: string }, {
      endpoint: string;
    }>({
      query: (data) => ({
        url: '/vendor/notifications/push-unsubscribe',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['NotificationSettings'],
    }),
  }),
});

// Export hooks
export const {
  useGetNotificationsQuery,
  useGetNotificationQuery,
  useGetUnreadCountQuery,
  useCreateNotificationMutation,
  useUpdateNotificationMutation,
  useMarkAsReadMutation,
  useMarkAsUnreadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
  useBulkDeleteNotificationsMutation,
  useDeleteAllReadMutation,
  useGetNotificationSettingsQuery,
  useUpdateNotificationSettingsMutation,
  useSendTestNotificationMutation,
  useGetNotificationTemplatesQuery,
  useSubscribeToPushNotificationsMutation,
  useUnsubscribeFromPushNotificationsMutation,
} = notificationsApiSlice;
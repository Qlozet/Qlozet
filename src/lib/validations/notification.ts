// Notification Validation Schemas - Zod
// Validation schemas for notification-related forms and data

import { z } from 'zod';

// Notification Type Schema
export const notificationTypeSchema = z.enum([
  'order',
  'customer',
  'product',
  'system',
  'payment',
  'shipping',
  'promotion',
]);

// Notification Priority Schema
export const notificationPrioritySchema = z.enum([
  'low',
  'medium',
  'high',
  'urgent',
]);

// Base Notification Schema
const notificationBaseSchema = z.object({
  type: notificationTypeSchema,
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  message: z
    .string()
    .min(1, 'Message is required')
    .max(1000, 'Message is too long'),
  priority: notificationPrioritySchema.default('medium'),
  actionUrl: z
    .string()
    .url('Invalid URL format')
    .max(500, 'URL is too long')
    .optional()
    .or(z.literal('')),
  actionText: z
    .string()
    .max(50, 'Action text is too long')
    .optional()
    .or(z.literal('')),
  metadata: z.record(z.unknown()).optional(),
});

// Create Notification Schema
export const createNotificationSchema = notificationBaseSchema
  .extend({
    scheduleFor: z
      .string()
      .refine(
        (date) => !date || !isNaN(Date.parse(date)),
        'Invalid schedule date'
      )
      .optional(),
    expiresAt: z
      .string()
      .refine(
        (date) => !date || !isNaN(Date.parse(date)),
        'Invalid expiration date'
      )
      .optional(),
  })
  .refine(
    (data) => {
      if (data.scheduleFor && data.expiresAt) {
        const scheduleDate = new Date(data.scheduleFor);
        const expirationDate = new Date(data.expiresAt);
        return scheduleDate < expirationDate;
      }
      return true;
    },
    {
      message: 'Schedule date must be before expiration date',
      path: ['expiresAt'],
    }
  );

// Update Notification Schema
export const updateNotificationSchema = z
  .object({
    _id: z.string().min(1, 'Notification ID is required'),
    isRead: z.boolean().optional(),
    title: z
      .string()
      .min(1, 'Title is required')
      .max(200, 'Title is too long')
      .optional(),
    message: z
      .string()
      .min(1, 'Message is required')
      .max(1000, 'Message is too long')
      .optional(),
    priority: notificationPrioritySchema.optional(),
    actionUrl: z
      .string()
      .url('Invalid URL format')
      .max(500, 'URL is too long')
      .optional()
      .or(z.literal('')),
    actionText: z
      .string()
      .max(50, 'Action text is too long')
      .optional()
      .or(z.literal('')),
  })
  .partial()
  .required({ _id: true });

// Notification Filter Schema
export const notificationFilterSchema = z.object({
  type: notificationTypeSchema.or(z.literal('all')).default('all'),
  isRead: z.boolean().optional(),
  priority: notificationPrioritySchema.or(z.literal('all')).default('all'),
  dateRange: z
    .object({
      startDate: z
        .string()
        .refine((date) => !isNaN(Date.parse(date)), 'Invalid start date'),
      endDate: z
        .string()
        .refine((date) => !isNaN(Date.parse(date)), 'Invalid end date'),
    })
    .optional(),
  sortBy: z.enum(['createdAt', 'priority', 'type']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// Notification Settings Schema
export const notificationSettingsSchema = z.object({
  emailNotifications: z.object({
    newOrders: z.boolean().default(true),
    orderStatusUpdates: z.boolean().default(true),
    paymentAlerts: z.boolean().default(true),
    lowStockAlerts: z.boolean().default(true),
    customerMessages: z.boolean().default(true),
    systemUpdates: z.boolean().default(false),
    promotionalEmails: z.boolean().default(false),
  }),
  pushNotifications: z.object({
    newOrders: z.boolean().default(true),
    orderStatusUpdates: z.boolean().default(true),
    paymentAlerts: z.boolean().default(true),
    lowStockAlerts: z.boolean().default(true),
    customerMessages: z.boolean().default(true),
    systemUpdates: z.boolean().default(false),
  }),
  smsNotifications: z.object({
    urgentAlerts: z.boolean().default(true),
    paymentFailures: z.boolean().default(true),
    systemDowntime: z.boolean().default(true),
  }),
});

// Bulk Delete Notifications Schema
export const bulkDeleteNotificationsSchema = z.object({
  notificationIds: z
    .array(z.string().min(1, 'Invalid notification ID'))
    .min(1, 'At least one notification must be selected')
    .max(100, 'Too many notifications selected'),
});

// Mark All Read Schema
export const markAllReadSchema = z.object({
  type: notificationTypeSchema.optional(),
  olderThan: z
    .string()
    .refine((date) => !date || !isNaN(Date.parse(date)), 'Invalid date')
    .optional(),
});

// Delete All Read Schema
export const deleteAllReadSchema = z.object({
  type: notificationTypeSchema.optional(),
  olderThan: z
    .string()
    .refine((date) => !date || !isNaN(Date.parse(date)), 'Invalid date')
    .optional(),
});

// Test Notification Schema
export const testNotificationSchema = z.object({
  type: z.enum(['email', 'push', 'sms']),
  template: z
    .string()
    .min(1, 'Template is required')
    .max(100, 'Template name is too long'),
});

// Push Subscription Schema
export const pushSubscriptionSchema = z.object({
  endpoint: z.string().url('Invalid endpoint URL'),
  keys: z.object({
    p256dh: z.string().min(1, 'p256dh key is required'),
    auth: z.string().min(1, 'auth key is required'),
  }),
});

// Notification Template Schema (for admin/system use)
export const notificationTemplateSchema = z.object({
  name: z
    .string()
    .min(1, 'Template name is required')
    .max(100, 'Name is too long'),
  type: notificationTypeSchema,
  subject: z
    .string()
    .min(1, 'Subject is required')
    .max(200, 'Subject is too long'),
  content: z
    .string()
    .min(1, 'Content is required')
    .max(5000, 'Content is too long'),
  variables: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
});

// Scheduled Notification Schema
export const scheduledNotificationSchema = createNotificationSchema.extend({
  scheduleFor: z
    .string()
    .min(1, 'Schedule date is required')
    .refine((date) => !isNaN(Date.parse(date)), 'Invalid schedule date')
    .refine(
      (date) => new Date(date) > new Date(),
      'Schedule date must be in the future'
    ),
  recurring: z
    .object({
      enabled: z.boolean().default(false),
      frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
      interval: z.coerce.number().int().min(1).max(365).optional(), // e.g., every 2 days
      endDate: z
        .string()
        .refine((date) => !date || !isNaN(Date.parse(date)), 'Invalid end date')
        .optional(),
    })
    .optional(),
});

// Notification Analytics Schema
export const notificationAnalyticsSchema = z.object({
  dateRange: z.object({
    startDate: z
      .string()
      .refine((date) => !isNaN(Date.parse(date)), 'Invalid start date'),
    endDate: z
      .string()
      .refine((date) => !isNaN(Date.parse(date)), 'Invalid end date'),
  }),
  groupBy: z
    .enum(['type', 'priority', 'status', 'day', 'week', 'month'])
    .default('day'),
  metrics: z
    .array(z.enum(['sent', 'delivered', 'read', 'clicked', 'failed']))
    .min(1, 'At least one metric must be selected'),
});

// Type exports
export type CreateNotificationData = z.infer<typeof createNotificationSchema>;
export type UpdateNotificationData = z.infer<typeof updateNotificationSchema>;
export type NotificationFilterData = z.infer<typeof notificationFilterSchema>;
export type NotificationSettingsData = z.infer<
  typeof notificationSettingsSchema
>;
export type BulkDeleteNotificationsData = z.infer<
  typeof bulkDeleteNotificationsSchema
>;
export type MarkAllReadData = z.infer<typeof markAllReadSchema>;
export type DeleteAllReadData = z.infer<typeof deleteAllReadSchema>;
export type TestNotificationData = z.infer<typeof testNotificationSchema>;
export type PushSubscriptionData = z.infer<typeof pushSubscriptionSchema>;
export type NotificationTemplateData = z.infer<
  typeof notificationTemplateSchema
>;
export type ScheduledNotificationData = z.infer<
  typeof scheduledNotificationSchema
>;
export type NotificationAnalyticsData = z.infer<
  typeof notificationAnalyticsSchema
>;

// Default values
export const createDefaultNotificationData = (): CreateNotificationData => ({
  type: 'system',
  title: '',
  message: '',
  priority: 'medium',
  actionUrl: '',
  actionText: '',
  metadata: {},
});

export const createDefaultNotificationFilterData =
  (): NotificationFilterData => ({
    type: 'all',
    priority: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 20,
  });

export const createDefaultNotificationSettings =
  (): NotificationSettingsData => ({
    emailNotifications: {
      newOrders: true,
      orderStatusUpdates: true,
      paymentAlerts: true,
      lowStockAlerts: true,
      customerMessages: true,
      systemUpdates: false,
      promotionalEmails: false,
    },
    pushNotifications: {
      newOrders: true,
      orderStatusUpdates: true,
      paymentAlerts: true,
      lowStockAlerts: true,
      customerMessages: true,
      systemUpdates: false,
    },
    smsNotifications: {
      urgentAlerts: true,
      paymentFailures: true,
      systemDowntime: true,
    },
  });

// Validation helpers
export const validateNotificationMetadata = (
  type: string,
  metadata: any
): boolean => {
  const requiredFields: Record<string, string[]> = {
    order: ['orderId'],
    customer: ['customerId'],
    product: ['productId'],
    payment: ['amount'],
    shipping: ['orderId', 'trackingNumber'],
  };

  const required = requiredFields[type] || [];
  return required.every((field) => metadata && metadata[field]);
};

export const getNotificationPriorityColor = (priority: string): string => {
  const colors = {
    low: 'text-green-600 bg-green-50',
    medium: 'text-blue-600 bg-blue-50',
    high: 'text-orange-600 bg-orange-50',
    urgent: 'text-red-600 bg-red-50',
  };
  return colors[priority as keyof typeof colors] || colors.medium;
};

export const getNotificationTypeIcon = (type: string): string => {
  const icons = {
    order: '📦',
    customer: '👤',
    product: '📋',
    system: '⚙️',
    payment: '💳',
    shipping: '🚚',
    promotion: '🎁',
  };
  return icons[type as keyof typeof icons] || '📬';
};

// Schedule validation
export const validateNotificationSchedule = (
  scheduleFor: string,
  expiresAt?: string
): boolean => {
  const scheduleDate = new Date(scheduleFor);
  const now = new Date();

  if (scheduleDate <= now) return false;

  if (expiresAt) {
    const expirationDate = new Date(expiresAt);
    return scheduleDate < expirationDate;
  }

  return true;
};

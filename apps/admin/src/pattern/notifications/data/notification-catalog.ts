// Notification settings catalog.
//
// These are the product-defined notification *event types* the admin can toggle
// on/off and target per channel — not fabricated data. The enabled-state and
// target shown here are the seed/default values; once the backend exposes a
// notifications endpoint, the live values should be merged over these defaults
// (see the TODOs in notifications-template.tsx).

export type NotificationChannel = 'push' | 'email';

export type NotificationTarget = 'vendor' | 'customer' | 'both' | 'admin';

// Human-readable label shown in the card target row + pickers.
export const TARGET_LABELS: Record<NotificationTarget, string> = {
  vendor: 'Vendor Only',
  customer: 'Customer Only',
  both: 'Vendor & Customer',
  admin: 'Admin Only',
};

export const TARGET_OPTIONS: { label: string; value: NotificationTarget }[] = [
  { label: TARGET_LABELS.vendor, value: 'vendor' },
  { label: TARGET_LABELS.customer, value: 'customer' },
  { label: TARGET_LABELS.both, value: 'both' },
];

// Audience options for the "Add Notifications" composer. A single audience maps
// directly onto a NotificationTarget (no "both" here — matching the design).
export const AUDIENCE_OPTIONS: { label: string; value: NotificationTarget }[] = [
  { label: 'Customer', value: 'customer' },
  { label: 'Vendor', value: 'vendor' },
  { label: 'Admin', value: 'admin' },
];

// How a composed notification fires.
export type NotificationTrigger = 'event-based' | 'manual' | 'scheduled';

export const TRIGGER_OPTIONS: { label: string; value: NotificationTrigger }[] = [
  { label: 'Event-based', value: 'event-based' },
  { label: 'Manual', value: 'manual' },
  { label: 'Scheduled', value: 'scheduled' },
];

// Payload produced by the Add Notifications composer.
export interface NotificationDraft {
  subject: string;
  /** Rich-text HTML from the editor. */
  body: string;
  audience: NotificationTarget;
  trigger: NotificationTrigger;
  /** Only meaningful when trigger === 'scheduled'. */
  date?: string;
  time?: string;
}

export const CHANNEL_LABELS: Record<NotificationChannel, string> = {
  push: 'Push Notifications',
  email: 'Email Notification',
};

// A single configurable notification type.
export interface NotificationSetting {
  /** Stable identifier — also the API key once endpoints exist. */
  key: string;
  title: string;
  description: string;
  target: NotificationTarget;
  /** Whether the notification is enabled per delivery channel. */
  enabled: Record<NotificationChannel, boolean>;
  /** Marks admin-created entries (vs. the built-in catalog). */
  custom?: boolean;
}

// Seed catalog mirroring the design.
export const NOTIFICATION_CATALOG: NotificationSetting[] = [
  {
    key: 'order_confirmed',
    title: 'Order Confirmed',
    description: 'When order is placed',
    target: 'vendor',
    enabled: { email: true, push: true },
  },
  {
    key: 'marketing_updates',
    title: 'Marketing Updates',
    description: 'When there is a marketing update',
    target: 'vendor',
    enabled: { email: false, push: false },
  },
  {
    key: 'order_shipped',
    title: 'Order Shipped',
    description: 'When order is in transit to the Customer',
    target: 'both',
    enabled: { email: true, push: true },
  },
  {
    key: 'weekly_highlight',
    title: 'Weekly Highlight',
    description: 'Scheduled (Every Friday)',
    target: 'customer',
    enabled: { email: false, push: false },
  },
  {
    key: 'price_drop_alert',
    title: 'Price Drop Alert',
    description: 'Product discounts by a followed vendor',
    target: 'customer',
    enabled: { email: false, push: false },
  },
  {
    key: 'order_received',
    title: 'Order Received',
    description: 'When new order is assigned',
    target: 'vendor',
    enabled: { email: true, push: true },
  },
];

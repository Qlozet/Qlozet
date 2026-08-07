import type { Metadata } from 'next';

import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Notifications',
  description: 'Review updates about your orders, payouts and account.',
  path: '/notification',
});

export default function NotificationSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

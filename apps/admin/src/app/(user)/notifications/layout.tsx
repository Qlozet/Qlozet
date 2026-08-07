import type { Metadata } from 'next';

import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Notifications',
  description:
    'Manage notification preferences and delivery channels.',
  path: '/notifications',
});

export default function NotificationsSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

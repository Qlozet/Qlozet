import type { Metadata } from 'next';

import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Dashboard',
  description:
    'Marketplace performance at a glance — revenue, orders, vendor activity and customer growth.',
  path: '/dashboard',
});

export default function DashboardSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

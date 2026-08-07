import type { Metadata } from 'next';

import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Dashboard',
  description:
    'Your business at a glance — sales, orders, payouts and customer activity.',
  path: '/dashboard',
});

export default function DashboardSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

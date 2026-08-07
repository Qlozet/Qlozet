import type { Metadata } from 'next';

import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Orders',
  description:
    'Track, fulfil and manage every order placed with your business.',
  path: '/orders',
});

export default function OrdersSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

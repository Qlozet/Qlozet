import type { Metadata } from 'next';

import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Orders',
  description:
    'Track and manage every order placed across the Qlozet marketplace.',
  path: '/orders',
});

export default function OrdersSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

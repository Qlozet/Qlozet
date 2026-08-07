import type { Metadata } from 'next';

import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Customers',
  description:
    'View your customers, their order history and saved measurements.',
  path: '/customers',
});

export default function CustomersSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

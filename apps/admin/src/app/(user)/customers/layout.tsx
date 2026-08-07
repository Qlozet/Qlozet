import type { Metadata } from 'next';

import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Customers',
  description:
    'View customer accounts, order history and measurement profiles.',
  path: '/customers',
});

export default function CustomersSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

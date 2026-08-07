import type { Metadata } from 'next';

import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Vendors',
  description:
    'Review, verify and manage the vendors trading on the Qlozet marketplace.',
  path: '/vendors',
});

export default function VendorsSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

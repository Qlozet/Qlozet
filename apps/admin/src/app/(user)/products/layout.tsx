import type { Metadata } from 'next';

import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Products',
  description:
    'Browse and manage the clothing, fabrics and accessories listed on the marketplace.',
  path: '/products',
});

export default function ProductsSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

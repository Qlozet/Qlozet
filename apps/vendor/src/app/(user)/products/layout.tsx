import type { Metadata } from 'next';

import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Products',
  description:
    'Manage your clothing, fabrics, accessories, collections and discounts.',
  path: '/products',
});

export default function ProductsSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

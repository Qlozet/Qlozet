import type { Metadata } from 'next';

import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Support',
  description:
    'Handle customer and vendor support tickets and live chat conversations.',
  path: '/support',
});

export default function SupportSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

import type { Metadata } from 'next';

import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Support',
  description:
    'Raise support tickets and follow up on your conversations with Qlozet.',
  path: '/support',
});

export default function SupportSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

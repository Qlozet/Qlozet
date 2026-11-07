import type { Metadata } from 'next';

import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Waitlist',
  description: 'People who joined the waitlist before launch.',
  path: '/waitlist',
});

export default function WaitlistSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

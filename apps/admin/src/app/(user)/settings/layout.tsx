import type { Metadata } from 'next';

import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Settings',
  description:
    'Configure platform settings, pricing and marketplace preferences.',
  path: '/settings',
});

export default function SettingsSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

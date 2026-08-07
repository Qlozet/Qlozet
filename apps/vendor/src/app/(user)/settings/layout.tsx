import type { Metadata } from 'next';

import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Settings',
  description:
    'Manage your business profile, warehouses, team and account preferences.',
  path: '/settings',
});

export default function SettingsSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

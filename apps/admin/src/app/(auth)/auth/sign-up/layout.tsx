import type { Metadata } from 'next';

import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Create account',
  description:
    'Create a Qlozet admin account.',
  path: '/auth/sign-up',
});

export default function SignUpSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

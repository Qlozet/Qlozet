import type { Metadata } from 'next';

import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Sign in',
  description:
    'Sign in to the Qlozet admin console.',
  path: '/auth/sign-in',
});

export default function SignInSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

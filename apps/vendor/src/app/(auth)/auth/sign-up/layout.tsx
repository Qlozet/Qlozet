import type { Metadata } from 'next';

import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Create account',
  description:
    'Create a Qlozet vendor account and start selling.',
  path: '/auth/sign-up',
});

export default function SignUpSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

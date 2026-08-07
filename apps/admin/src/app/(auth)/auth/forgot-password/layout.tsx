import type { Metadata } from 'next';

import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Forgot password',
  description: 'Reset the password for your Qlozet admin account.',
  path: '/auth/forgot-password',
});

export default function ForgotPasswordSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

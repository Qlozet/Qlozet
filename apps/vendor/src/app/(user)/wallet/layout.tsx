import type { Metadata } from 'next';

import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Wallet',
  description: 'Track your balance, payouts and transaction history.',
  path: '/wallet',
});

export default function WalletSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

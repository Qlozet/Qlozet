import { Metadata } from 'next';
import { VerificationTemplate } from '@/pattern/verification/verification-template';

export const metadata: Metadata = {
  title: 'Get Verified',
  description:
    'Verify your identity, payout account and business registration.',
};

export default function VerificationPage() {
  return <VerificationTemplate />;
}

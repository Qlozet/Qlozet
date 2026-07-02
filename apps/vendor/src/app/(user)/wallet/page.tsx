'use client';

import React, { Suspense } from 'react';
import { WalletPageTemplate } from '@/pattern/wallet/templates/wallet-page-template';

const Wallet: React.FC = () => {
  return <WalletPageTemplate />;
};

export default function WalletPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-8">Loading...</div>}>
      <Wallet />
    </Suspense>
  );
}

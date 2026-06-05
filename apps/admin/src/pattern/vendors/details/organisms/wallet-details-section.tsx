'use client';

import { Wallet, Coins, Banknote, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MetricCard } from '@/pattern/common/molecules/metric-card';
import type { Business } from '@/redux/services/businesses/businesses.api-slice';
import type { VendorDashboardMetrics } from '@/redux/services/dashboard/dashboard.api-slice';
import { formatNaira } from '@/lib/vendors';
import { BankDetailsCard, type BankDetailRow } from '../molecules/bank-details-card';

interface WalletDetailsSectionProps {
  vendor?: Business;
  metrics?: VendorDashboardMetrics;
  onEditBank?: () => void;
}

const Icon = ({ bg, children }: { bg: string; children: React.ReactNode }) => (
  <div
    className={cn(
      'flex size-12 items-center justify-center rounded-[10px] text-white',
      bg
    )}
  >
    {children}
  </div>
);

const money = (value: unknown, fallback: string): string =>
  typeof value === 'number' ? formatNaira(value) : fallback;

const str = (value: unknown, fallback: string): string =>
  typeof value === 'string' && value.length > 0 ? value : fallback;

export const WalletDetailsSection = ({
  vendor,
  metrics,
  onEditBank,
}: WalletDetailsSectionProps) => {
  const m = (metrics ?? {}) as Record<string, unknown>;
  const bank = ((vendor?.bank ?? vendor?.bank_details ?? {}) as Record<string, unknown>);

  const bankRows: BankDetailRow[] = [
    {
      label: 'Account name',
      value: str(bank.account_name ?? vendor?.account_name, '—'),
    },
    {
      label: 'Account number',
      value: str(bank.account_number ?? vendor?.account_number, '—'),
    },
    {
      label: 'Bank Name',
      value: str(bank.bank_name ?? vendor?.bank_name, '—'),
    },
    {
      label: 'Kyc verified',
      value:
        (vendor?.kyc_verified ?? vendor?.isVerified) === false ? 'No' : 'Yes',
    },
  ];

  return (
    <div className="rounded-2xl bg-white p-5 custom-card-shadow">
      <h2 className="mb-5 text-lg font-bold text-[hsla(210,9%,31%,1)]">
        Wallet Details
      </h2>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Metric cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <MetricCard
            title="Wallet Balance"
            value={money(m.walletBalance, '—')}
            icon={
              <Icon bg="bg-[#5DDAB4]">
                <Wallet className="size-6" />
              </Icon>
            }
          />
          <MetricCard
            title="Pending Payment"
            value={money(m.pendingPayment, '—')}
            icon={
              <Icon bg="bg-[#E8A87C]">
                <Coins className="size-6" />
              </Icon>
            }
          />
          <MetricCard
            title="Total Payout"
            value={money(m.totalPayout, '—')}
            subLabel={str(m.lastPayoutDate, '')}
            icon={
              <Icon bg="bg-[#FF7976]">
                <Banknote className="size-6" />
              </Icon>
            }
          />
          <MetricCard
            title="Lifetime Earnings"
            value={money(m.lifetimeEarnings, '—')}
            icon={
              <Icon bg="bg-[#8B5CF6]">
                <ShoppingCart className="size-6" />
              </Icon>
            }
          />
        </div>

        {/* Bank details */}
        <BankDetailsCard rows={bankRows} onEdit={onEditBank} />
      </div>
    </div>
  );
};

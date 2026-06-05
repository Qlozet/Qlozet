'use client';

import type { ReactNode } from 'react';
import { Wallet, CircleDollarSign, Undo2, HandCoins } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MetricCard } from '@/pattern/common/molecules/metric-card';
import type { Customer } from '@/redux/services/customers/customers.api-slice';
import { CustomerTransactionsTable } from './customer-transactions-table';

interface CustomerWalletSectionProps {
  customer?: Customer;
}

const Icon = ({ bg, children }: { bg: string; children: ReactNode }) => (
  <div
    className={cn(
      'flex size-12 items-center justify-center rounded-[10px] text-white',
      bg
    )}
  >
    {children}
  </div>
);

const naira = (value: unknown, fallback: string): string =>
  typeof value === 'number' ? `N ${value.toLocaleString()}` : fallback;

export const CustomerWalletSection = ({
  customer,
}: CustomerWalletSectionProps) => {
  const c = (customer ?? {}) as Record<string, unknown>;

  const tokenBalance =
    typeof c.tokenBalance === 'number'
      ? `${c.tokenBalance.toLocaleString()} TCN`
      : '—';

  return (
    <section className="space-y-6">
      {/* Heading */}
      <div className="rounded-2xl bg-white px-6 py-5 custom-card-shadow">
        <h2 className="text-lg font-bold text-[hsla(210,9%,31%,1)]">
          Wallet Details
        </h2>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Wallet Balance"
          value={naira(c.walletBalance, '—')}
          icon={
            <Icon bg="bg-[#5DDAB4]">
              <Wallet className="size-6" />
            </Icon>
          }
        />
        <MetricCard
          title="Token Balance"
          value={tokenBalance}
          icon={
            <Icon bg="bg-[#FFB200]">
              <CircleDollarSign className="size-6" />
            </Icon>
          }
        />
        <MetricCard
          title="Total Returns"
          value={naira(c.totalReturns, '—')}
          icon={
            <Icon bg="bg-[#FF7976]">
              <Undo2 className="size-6" />
            </Icon>
          }
        />
        <MetricCard
          title="Lifetime Spending"
          value={naira(c.lifetimeSpending, '—')}
          icon={
            <Icon bg="bg-[#FF7976]">
              <HandCoins className="size-6" />
            </Icon>
          }
        />
      </div>

      {/* Recent transactions */}
      <CustomerTransactionsTable />
    </section>
  );
};

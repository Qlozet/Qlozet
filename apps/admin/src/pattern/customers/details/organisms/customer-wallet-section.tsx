'use client';

import type { ReactNode } from 'react';
import { Wallet, CircleDollarSign, Undo2, HandCoins } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MetricCard } from '@/pattern/common/molecules/metric-card';
import type { Customer } from '@/redux/services/customers/customers.api-slice';
import {
  formatNaira,
  getCustomerLifetimeSpending,
  getCustomerTokenBalance,
  getCustomerTotalReturns,
  getCustomerWalletBalance,
} from '@/lib/customers';
import { CustomerTransactionsTable } from './customer-transactions-table';

interface CustomerWalletSectionProps {
  customer?: Customer;
  /** Route id — the transactions table needs it before the record loads. */
  customerId: string;
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

// The four figures come from GET /admin/customer/:id. A customer who has never
// topped up has a balance of 0, and that is what shows — the dash is reserved
// for a figure the payload didn't carry at all.
export const CustomerWalletSection = ({
  customer,
  customerId,
}: CustomerWalletSectionProps) => {
  const c = customer ?? ({} as Customer);

  const tokens = getCustomerTokenBalance(c);
  const tokenBalance =
    typeof tokens === 'number' ? `${tokens.toLocaleString()} TCN` : '—';

  return (
    <section className="space-y-6">
      {/* Heading */}
      <div className="rounded-2xl bg-white dark:bg-card px-6 py-5 custom-card-shadow">
        <h2 className="text-lg font-bold text-[hsla(210,9%,31%,1)] dark:text-white">
          Wallet Details
        </h2>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Wallet Balance"
          value={formatNaira(getCustomerWalletBalance(c))}
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
          value={formatNaira(getCustomerTotalReturns(c))}
          icon={
            <Icon bg="bg-[#FF7976]">
              <Undo2 className="size-6" />
            </Icon>
          }
        />
        <MetricCard
          title="Lifetime Spending"
          value={formatNaira(getCustomerLifetimeSpending(c))}
          icon={
            <Icon bg="bg-[#FF7976]">
              <HandCoins className="size-6" />
            </Icon>
          }
        />
      </div>

      {/* Recent transactions */}
      <CustomerTransactionsTable customerId={customerId} />
    </section>
  );
};

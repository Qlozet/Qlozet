'use client';

// Wallet header: the two headline cards (Wallet Balance, Total Amount Received)
// plus the Send money / Fund wallet actions, matching the design.

import React, { ReactNode } from 'react';
import { Wallet, HandCoins } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { MetricCard } from '@/pattern/common/molecules/metric-card';
import { StatsCardSkeleton } from '@/pattern/dashboard/molecules/stats-card-skeleton';
import { LinearMoneySendIcon } from '@/pattern/common/atoms/linear-money-send-icon';
import { LinearReceiveMoneyIcon } from '@/pattern/common/atoms/linear-money-receive-icon';

const CardIcon = ({ bg, children }: { bg: string; children: ReactNode }) => (
  <div
    className={cn(
      'flex size-12 items-center justify-center rounded-[10px] text-white',
      bg
    )}
  >
    {children}
  </div>
);

// ₦ symbol for the card values (the transactions table uses the "NGN" prefix).
const formatBalance = (value?: number): string =>
  typeof value === 'number' && !Number.isNaN(value)
    ? `₦ ${value.toLocaleString()}`
    : '—';

interface WalletStatsSectionProps {
  /** Wallet balance from GET /wallets/balance. */
  balance?: number;
  isLoading?: boolean;
  onSendMoney?: () => void;
  onFundWallet?: () => void;
  /** Anchor the "History" link scrolls to (the transactions table). */
  historyHref?: string;
}

export const WalletStatsSection: React.FC<WalletStatsSectionProps> = ({
  balance,
  isLoading = false,
  onSendMoney,
  onFundWallet,
  historyHref = '#recent-transactions',
}) => {
  return (
    <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
      {/* Metric cards */}
      {isLoading ? (
        <div className='grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:max-w-[560px]'>
          <StatsCardSkeleton />
          <StatsCardSkeleton />
        </div>
      ) : (
        <div className='grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:max-w-[560px]'>
          <MetricCard
            title='Wallet Balance'
            value={formatBalance(balance)}
            change='0%'
            viewAllLink={historyHref}
            viewAllLabel='History'
            icon={
              <CardIcon bg='bg-[#57CAEB]'>
                <Wallet className='size-6' />
              </CardIcon>
            }
          />
          {/* TODO(api): no backend endpoint for "Total Amount Received" yet —
              show an honest placeholder until one exists. */}
          <MetricCard
            title='Total Amount Received'
            value='—'
            change='0%'
            icon={
              <CardIcon bg='bg-[#5DDAB4]'>
                <HandCoins className='size-6' />
              </CardIcon>
            }
          />
        </div>
      )}

      {/* Actions */}
      <div className='flex items-center gap-4 lg:pt-2'>
        <Button
          type='button'
          variant='outline'
          onClick={onSendMoney}
          className='h-11 gap-2'
        >
          <LinearMoneySendIcon />
          Send money
        </Button>
        <Button
          type='button'
          onClick={onFundWallet}
          className='bg-[#056921] text-white dark:text-white hover:bg-[#056921]/90 h-11 gap-2'
        >
          <LinearReceiveMoneyIcon />
          Fund wallet
        </Button>
      </div>
    </div>
  );
};

'use client';

// Wallet header: the two headline cards (Wallet Balance, Total Amount Received)
// plus the Send money / Fund wallet actions, matching the design.

import React, { ReactNode } from 'react';
import { Wallet, HandCoins, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { MetricCard } from '@/pattern/common/molecules/metric-card';
import { useAppSelector } from '@/redux/store';
import { selectActiveBusiness } from '@/redux/slices/auth-slice';
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
  /** Token balance from GET /token/balance. */
  tokenBalance?: number;
  isLoading?: boolean;
  isTokenLoading?: boolean;
  onSendMoney?: () => void;
  onFundWallet?: () => void;
  onPurchaseTokens?: () => void;
  /** Anchor the "History" link scrolls to (the transactions table). */
  historyHref?: string;
}

export const WalletStatsSection: React.FC<WalletStatsSectionProps> = ({
  balance,
  tokenBalance,
  isLoading = false,
  isTokenLoading = false,
  onSendMoney,
  onFundWallet,
  onPurchaseTokens,
  historyHref = '#recent-transactions',
}) => {
  const activeBusiness = useAppSelector(selectActiveBusiness);
  const isOwner = activeBusiness?.role === 'owner';

  return (
    <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
      {/* Metric cards */}
      <div className='grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:min-w-[850px]'>
        {isLoading ? (
          <>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </>
        ) : (
          <>
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
          </>
        )}
        
        {isTokenLoading ? (
          <StatsCardSkeleton />
        ) : (
          <MetricCard
            title='Token Balance'
            value={typeof tokenBalance === 'number' ? tokenBalance.toLocaleString() : '—'}
            change='0%'
            icon={
              <CardIcon bg='bg-[#EBB857]'>
                <HandCoins className='size-6' /> {/* Reusing HandCoins or use another if needed, will use a similar one */}
              </CardIcon>
            }
            actionButton={
              isOwner ? (
                <Button
                  variant='outline'
                  size='sm'
                  onClick={onPurchaseTokens}
                  className='h-8 px-3 text-xs flex items-center gap-2'
                >
                  <Sparkles className='size-3.5' />
                  Buy Tokens
                </Button>
              ) : undefined
            }
          />
        )}
      </div>

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

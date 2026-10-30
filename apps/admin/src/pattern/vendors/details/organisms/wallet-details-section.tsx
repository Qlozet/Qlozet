'use client';

import type { ReactNode } from 'react';
import {
  AlertTriangle,
  Banknote,
  CalendarClock,
  Landmark,
  Lock,
  Wallet,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MetricCard } from '@/pattern/common/molecules/metric-card';
import { Skeleton } from '@/components/ui/skeleton';
import type { Business } from '@/redux/services/businesses/businesses.api-slice';
import {
  useGetVendorWalletQuery,
  type VendorWallet,
} from '@/redux/services/vendor-details/vendor-details.api-slice';
import { formatNaira } from '@/lib/vendors';
import {
  BankDetailsCard,
  type BankDetailRow,
} from '../molecules/bank-details-card';

interface WalletDetailsSectionProps {
  businessId: string;
  vendor?: Business;
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

const shortDate = (value?: string | null): string => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

const longDate = (value?: string | null): string => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

// Identity verification lives on the business as a state machine; the old
// card read a kyc flag that does not exist and showed "Yes" when it was absent.
const VERIFICATION_LABEL: Record<string, string> = {
  approved: 'Verified',
  awaiting_review: 'Awaiting review',
  provider_complete: 'Awaiting review',
  in_progress: 'In progress',
  action_required: 'Action required',
  rejected: 'Rejected',
  not_started: 'Not started',
};

const verificationLabel = (vendor?: Business): string => {
  const state = vendor?.verification_state;
  if (typeof state === 'string' && VERIFICATION_LABEL[state]) {
    return VERIFICATION_LABEL[state];
  }
  return vendor?.status === 'verified' ? 'Verified' : 'Not started';
};

const STATUS_CHIP: Record<string, string> = {
  active:
    'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  suspended:
    'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  closed: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

const Notice = ({
  tone,
  children,
}: {
  tone: 'danger' | 'warn';
  children: ReactNode;
}) => (
  <div
    role="status"
    className={cn(
      'flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm',
      tone === 'danger'
        ? 'border-red-200 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200'
        : 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200'
    )}
  >
    <AlertTriangle className="mt-0.5 size-4 shrink-0" />
    <p>{children}</p>
  </div>
);

const Row = ({
  label,
  value,
  hint,
  strong,
}: {
  label: string;
  value: string;
  hint?: string;
  strong?: boolean;
}) => (
  <div className="flex items-baseline justify-between gap-4 py-2.5">
    <div className="min-w-0">
      <p className="text-sm text-gray-600 dark:text-gray-300">{label}</p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
    <p
      className={cn(
        'shrink-0 text-sm tabular-nums text-[hsla(210,9%,31%,1)] dark:text-white',
        strong ? 'font-bold' : 'font-semibold'
      )}
    >
      {value}
    </p>
  </div>
);

const Notices = ({ wallet }: { wallet: VendorWallet }) => {
  const drift = wallet.pending_drift;
  return (
    <div className="space-y-2">
      {wallet.owed_balance > 0 && (
        <Notice tone="danger">
          Owes {formatNaira(wallet.owed_balance)} from refunded orders.
          Withdrawals stay blocked until it is recovered from the next earnings
          release.
        </Notice>
      )}
      {wallet.withdrawal_hold > 0 && (
        <Notice tone="warn">
          {formatNaira(wallet.withdrawal_hold)} is held while a return is open
          on one of this vendor&apos;s orders.
        </Notice>
      )}
      {drift !== 0 && (
        <Notice tone="warn">
          The pending total is {formatNaira(Math.abs(drift))}{' '}
          {drift > 0 ? 'above' : 'below'} the earnings waiting for release. The
          wallet and the earnings ledger have drifted apart and need
          reconciling.
        </Notice>
      )}
    </div>
  );
};

export const WalletDetailsSection = ({
  businessId,
  vendor,
}: WalletDetailsSectionProps) => {
  const { data, isLoading, isError } = useGetVendorWalletQuery(businessId, {
    skip: !businessId,
  });
  const wallet = data?.data;

  const account = wallet?.payout_account;
  const bankRows: BankDetailRow[] = [
    {
      label: 'Payout account',
      value: account ? (account.linked ? 'Linked' : 'Not linked') : '—',
    },
    { label: 'Bank', value: account?.bank_name ?? '—' },
    { label: 'Account name', value: account?.account_name ?? '—' },
    { label: 'Account number', value: account?.account_number ?? '—' },
    {
      label: 'Paid through',
      value: account
        ? account.rail === 'stripe_connect'
          ? 'Stripe Connect'
          : 'Paystack'
        : '—',
    },
    { label: 'Identity verification', value: verificationLabel(vendor) },
  ];

  const scheduled = wallet
    ? Math.max(0, wallet.unreleased_earnings - wallet.awaiting_delivery)
    : 0;
  const last = wallet?.payouts.last;

  return (
    <section
      aria-labelledby="vendor-wallet-heading"
      className="rounded-2xl bg-white dark:bg-card p-5 custom-card-shadow"
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2
            id="vendor-wallet-heading"
            className="text-lg font-bold text-[hsla(210,9%,31%,1)] dark:text-white"
          >
            Wallet Details
          </h2>
          {wallet && (
            <span
              className={cn(
                'rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
                wallet.has_wallet && wallet.status
                  ? STATUS_CHIP[wallet.status]
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
              )}
            >
              {wallet.has_wallet
                ? (wallet.status ?? 'active')
                : 'No wallet yet'}
            </span>
          )}
        </div>
        {wallet?.last_transaction_at && (
          <p className="text-xs text-muted-foreground">
            Last activity {longDate(wallet.last_transaction_at)}
          </p>
        )}
      </div>

      {isError && (
        <p className="mb-4 text-sm text-red-600 dark:text-red-400">
          The wallet could not be loaded. Refresh the page to try again.
        </p>
      )}

      {wallet && (
        <div className="mb-5">
          <Notices wallet={wallet} />
        </div>
      )}

      {/* Headline figures */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[120px] rounded-[12px]" />
          ))
        ) : (
          <>
            <MetricCard
              title="Available to withdraw"
              value={formatNaira(wallet?.available_to_withdraw)}
              subLabel={
                wallet ? `of ${formatNaira(wallet.balance)}` : undefined
              }
              icon={
                <Icon bg="bg-[#5DDAB4]">
                  <Wallet className="size-6" />
                </Icon>
              }
            />
            <MetricCard
              title="Pending release"
              value={formatNaira(wallet?.pending_balance)}
              subLabel={
                wallet?.next_release
                  ? `next ${shortDate(wallet.next_release.date)}`
                  : undefined
              }
              icon={
                <Icon bg="bg-[#E8A87C]">
                  <CalendarClock className="size-6" />
                </Icon>
              }
            />
            <MetricCard
              title="Withdrawn to date"
              value={formatNaira(wallet?.payouts.total_withdrawn)}
              subLabel={last ? `last ${shortDate(last.created_at)}` : undefined}
              icon={
                <Icon bg="bg-[#FF7976]">
                  <Banknote className="size-6" />
                </Icon>
              }
            />
            <MetricCard
              title="Lifetime earnings"
              value={formatNaira(wallet?.lifetime.net)}
              subLabel={wallet ? 'after commission' : undefined}
              icon={
                <Icon bg="bg-[#8B5CF6]">
                  <Landmark className="size-6" />
                </Icon>
              }
            />
          </>
        )}
      </div>

      {/* Where the money is, and where it went */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="rounded-xl bg-white p-5 custom-card-shadow dark:bg-card">
          <h3 className="mb-1 text-base font-semibold text-[hsla(210,9%,31%,1)] dark:text-white">
            Earnings
          </h3>
          <div className="divide-y divide-border">
            <Row
              label="Gross sales"
              value={formatNaira(wallet?.lifetime.gross)}
            />
            <Row
              label="Platform commission"
              value={
                wallet ? `−${formatNaira(wallet.lifetime.commission)}` : '—'
              }
            />
            <Row
              label="Net earnings"
              value={formatNaira(wallet?.lifetime.net)}
              strong
            />
            <Row
              label="Released to wallet"
              value={formatNaira(wallet?.lifetime.released)}
            />
            <Row
              label="Scheduled for release"
              hint={
                wallet?.next_release
                  ? `${formatNaira(wallet.next_release.amount)} due ${longDate(wallet.next_release.date)}`
                  : undefined
              }
              value={wallet ? formatNaira(scheduled) : '—'}
            />
            <Row
              label="Not yet dated"
              hint="Older earnings without a payout date. They are given one (14 days after payment) within the hour"
              value={formatNaira(wallet?.awaiting_delivery)}
            />
          </div>
        </div>

        <div className="rounded-xl bg-white p-5 custom-card-shadow dark:bg-card">
          <h3 className="mb-1 text-base font-semibold text-[hsla(210,9%,31%,1)] dark:text-white">
            Payouts
          </h3>
          <div className="divide-y divide-border">
            <Row label="Wallet balance" value={formatNaira(wallet?.balance)} />
            <Row
              label="Held for open returns"
              value={formatNaira(wallet?.withdrawal_hold)}
            />
            <Row
              label="Owed to the platform"
              value={formatNaira(wallet?.owed_balance)}
            />
            <Row
              label="In flight"
              hint="Requested, not yet confirmed by the bank"
              value={formatNaira(wallet?.payouts.in_flight)}
            />
            <Row
              label="Last payout"
              hint={
                last
                  ? `${longDate(last.created_at)} · ${last.status}`
                  : undefined
              }
              value={last ? formatNaira(last.amount) : 'None yet'}
            />
            <Row
              label="Failed payouts"
              value={wallet ? String(wallet.payouts.failed_count) : '—'}
            />
          </div>
          {wallet && (
            <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Lock className="size-3.5" />
              Minimum withdrawal {formatNaira(wallet.minimum_payout)}
            </p>
          )}
        </div>

        <BankDetailsCard rows={bankRows} />
      </div>
    </section>
  );
};

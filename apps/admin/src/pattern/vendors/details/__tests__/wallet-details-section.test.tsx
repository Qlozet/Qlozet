import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

const walletQuery = vi.fn();

vi.mock('@/redux/services/vendor-details/vendor-details.api-slice', () => ({
  useGetVendorWalletQuery: (...args: unknown[]) => walletQuery(...args),
}));

import { WalletDetailsSection } from '../organisms/wallet-details-section';

const wallet = (patch: Record<string, unknown> = {}) => ({
  business_id: 'b1',
  business_name: 'BantuBlue',
  has_wallet: true,
  currency: 'NGN',
  status: 'active',
  last_transaction_at: '2026-10-10T09:00:00.000Z',
  balance: 50_000,
  pending_balance: 27_000,
  owed_balance: 0,
  withdrawal_hold: 0,
  available_to_withdraw: 50_000,
  minimum_payout: 5_000,
  lifetime: {
    gross: 100_000,
    commission: 10_000,
    net: 90_000,
    released: 63_000,
  },
  unreleased_earnings: 27_000,
  awaiting_delivery: 18_000,
  pending_drift: 0,
  next_release: { date: '2026-10-20T00:00:00.000Z', amount: 9_000 },
  payouts: {
    total_withdrawn: 13_000,
    in_flight: 0,
    failed_count: 0,
    count: 2,
    last: {
      amount: 8_000,
      status: 'success',
      reference: 'ref',
      created_at: '2026-10-01T00:00:00.000Z',
    },
  },
  payout_account: {
    linked: true,
    rail: 'paystack',
    bank_name: 'GTBank',
    account_name: 'BANTU BLUE LTD',
    account_number: '******6789',
  },
  ...patch,
});

const withWallet = (w: unknown) =>
  walletQuery.mockReturnValue({
    data: { data: w },
    isLoading: false,
    isError: false,
  });

beforeEach(() => walletQuery.mockReset());

describe('WalletDetailsSection', () => {
  it('reads the vendor in the path, not the dashboard metrics', () => {
    withWallet(wallet());
    render(<WalletDetailsSection businessId="b1" />);
    expect(walletQuery).toHaveBeenCalledWith('b1', { skip: false });
  });

  it('shows real figures where every card used to read a dash', () => {
    withWallet(wallet());
    render(<WalletDetailsSection businessId="b1" />);
    expect(screen.getByText('Available to withdraw')).toBeInTheDocument();
    expect(screen.getAllByText('₦50,000').length).toBeGreaterThan(0);
    expect(screen.getByText('₦13,000')).toBeInTheDocument();
    expect(screen.getAllByText('₦90,000').length).toBeGreaterThan(0);
    // Unreleased 27,000 less 18,000 awaiting delivery is scheduled.
    expect(screen.getByText('₦9,000')).toBeInTheDocument();
  });

  it('shows the payout account masked, and verification from the real state', () => {
    withWallet(wallet());
    render(
      <WalletDetailsSection
        businessId="b1"
        vendor={{ _id: 'b1', verification_state: 'action_required' }}
      />
    );
    expect(screen.getByText('******6789')).toBeInTheDocument();
    expect(screen.getByText('Linked')).toBeInTheDocument();
    expect(screen.getByText('Action required')).toBeInTheDocument();
  });

  it('a vendor with no verification on file is not called verified', () => {
    withWallet(wallet());
    render(<WalletDetailsSection businessId="b1" vendor={{ _id: 'b1' }} />);
    expect(screen.getByText('Not started')).toBeInTheDocument();
    expect(screen.queryByText('Verified')).toBeNull();
  });

  it('warns about debt, an open-return hold and ledger drift', () => {
    withWallet(
      wallet({
        owed_balance: 4_000,
        withdrawal_hold: 20_000,
        available_to_withdraw: 0,
        pending_drift: 3_000,
      })
    );
    render(<WalletDetailsSection businessId="b1" />);
    const notices = screen.getAllByRole('status').map((n) => n.textContent);
    expect(notices.some((t) => t?.includes('Owes ₦4,000'))).toBe(true);
    expect(notices.some((t) => t?.includes('₦20,000 is held'))).toBe(true);
    expect(notices.some((t) => t?.includes('₦3,000 above'))).toBe(true);
  });

  it('a calm wallet shows no warnings', () => {
    withWallet(wallet());
    render(<WalletDetailsSection businessId="b1" />);
    expect(screen.queryAllByRole('status')).toHaveLength(0);
  });

  it('says so when the vendor has no wallet yet', () => {
    withWallet(wallet({ has_wallet: false, status: null, balance: 0 }));
    render(<WalletDetailsSection businessId="b1" />);
    expect(screen.getByText('No wallet yet')).toBeInTheDocument();
  });
});

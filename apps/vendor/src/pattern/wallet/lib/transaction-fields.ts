// Tolerant accessors + formatters for vendor wallet transaction rows.
//
// GET /transactions/vendor has no documented response shape, so rows arrive
// loosely typed. These helpers read the most likely keys and fall back
// gracefully — mirroring the approach used for orders (order-fields.ts).

import type { VendorTransaction } from '@/redux/services/wallet/wallet.api-slice';

export type TransactionRow = VendorTransaction;

const asDict = (v: unknown): Record<string, unknown> =>
  v && typeof v === 'object' ? (v as Record<string, unknown>) : {};

const str = (v: unknown): string | undefined =>
  typeof v === 'string' && v.trim() ? v.trim() : undefined;

const num = (v: unknown): number | undefined => {
  if (typeof v === 'number' && !Number.isNaN(v)) return v;
  if (typeof v === 'string' && v.trim() && !Number.isNaN(Number(v)))
    return Number(v);
  return undefined;
};

// "NGN 20,000" — matches the Orders table amount style.
export const formatNaira = (value?: number): string =>
  typeof value === 'number' && !Number.isNaN(value)
    ? `NGN ${value.toLocaleString()}`
    : '—';

// DD/MM/YYYY to match the design (e.g. "23/07/2023").
export const formatDate = (value?: unknown): string => {
  const s = str(value);
  if (!s) return '—';
  const date = new Date(s);
  if (Number.isNaN(date.getTime())) return s;
  const day = `${date.getDate()}`.padStart(2, '0');
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()}`;
};

export const readTransactionDate = (t: TransactionRow): unknown =>
  t.createdAt ?? t.date ?? t.transaction_date ?? t.transactionDate;

export const readTransactionId = (t: TransactionRow): string =>
  str(t.transactionId) ??
  str(t.reference) ??
  str(t.transaction_id) ??
  str(t._id) ??
  '—';

export const readTransactionType = (t: TransactionRow): string =>
  str(t.transType) ??
  str(t.transactionType) ??
  str(t.transaction_type) ??
  str(t.type) ??
  '—';

// Narration falls back to "Nil" (matches the design's empty-narration row).
export const readNarration = (t: TransactionRow): string =>
  str(t.narration) ??
  str(t.description) ??
  str(t.remark) ??
  str(t.note) ??
  'Nil';

export const readAmount = (t: TransactionRow): number | undefined =>
  num(t.amount) ?? num(t.value) ?? num(t.total);

export const readStatus = (t: TransactionRow): string =>
  (str(t.status) ?? 'pending').toLowerCase();

// ─── Transaction detail fields ──────────────────────────────────────────────

export const readSender = (t: TransactionRow): string =>
  str(t.sender) ??
  str(t.senderName) ??
  str(t.sender_name) ??
  str(asDict(t.sender).name) ??
  '—';

// "3109876543 - Firstbank" — combines the sender's account number and bank.
export const readSenderAccount = (t: TransactionRow): string => {
  const account =
    str(t.senderAccountNumber) ??
    str(t.sender_account_number) ??
    str(t.senderAccount) ??
    str(t.sender_account);
  const bank =
    str(t.senderBank) ?? str(t.sender_bank) ?? str(t.bank) ?? str(t.bankName);
  if (account && bank) return `${account} - ${bank}`;
  return account ?? bank ?? '—';
};

export const readBalanceBefore = (t: TransactionRow): number | undefined =>
  num(t.balanceBefore) ?? num(t.balance_before);

export const readBalanceAfter = (t: TransactionRow): number | undefined =>
  num(t.balanceAfter) ?? num(t.balance_after);

// The transaction's channel, mapped to a vendor-facing label describing what it
// was for. Falls back to a title-cased raw value, then "—".
export const readChannel = (t: TransactionRow): string => {
  const raw = (str(t.channel) ?? '').toLowerCase();
  const labels: Record<string, string> = {
    checkout: 'Order payment',
    wallet_topup: 'Wallet top-up',
    wallet_checkout: 'Wallet payment',
    refund: 'Refund',
    payout: 'Payout',
    earning: 'Earning',
    reservation: 'Fabric reservation',
  };
  if (labels[raw]) return labels[raw];
  if (!raw) return '—';
  return raw
    .split(/[_\s-]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
};

// Status pill: label + colour classes, matching the design.
export interface TransactionBadge {
  label: string;
  className: string;
}

export const transactionBadge = (status: string): TransactionBadge => {
  const s = status.toLowerCase().replace(/[\s-]+/g, '_');
  const map: Record<string, TransactionBadge> = {
    pending: {
      label: 'Pending',
      className:
        'bg-[#FEF6E7] dark:bg-[#DD900D]/10 text-[#DD900D] dark:text-[#FBBF24]',
    },
    processing: {
      label: 'Pending',
      className:
        'bg-[#FEF6E7] dark:bg-[#DD900D]/10 text-[#DD900D] dark:text-[#FBBF24]',
    },
    in_review: {
      label: 'Pending',
      className:
        'bg-[#FEF6E7] dark:bg-[#DD900D]/10 text-[#DD900D] dark:text-[#FBBF24]',
    },
    successful: {
      label: 'Successful',
      className:
        'bg-[#E7F6EC] dark:bg-[#0F973D]/10 text-[#0F973D] dark:text-[#4ADE80]',
    },
    success: {
      label: 'Successful',
      className:
        'bg-[#E7F6EC] dark:bg-[#0F973D]/10 text-[#0F973D] dark:text-[#4ADE80]',
    },
    completed: {
      label: 'Successful',
      className:
        'bg-[#E7F6EC] dark:bg-[#0F973D]/10 text-[#0F973D] dark:text-[#4ADE80]',
    },
    failed: {
      label: 'Failed',
      className:
        'bg-[#FBEAE9] dark:bg-[#D42620]/10 text-[#D42620] dark:text-[#F87171]',
    },
    cancelled: {
      label: 'Failed',
      className:
        'bg-[#FBEAE9] dark:bg-[#D42620]/10 text-[#D42620] dark:text-[#F87171]',
    },
    refund: {
      label: 'Refund',
      className:
        'bg-[#F4EBFF] dark:bg-[#7E22CE]/10 text-[#7E22CE] dark:text-[#C084FC]',
    },
    refunded: {
      label: 'Refund',
      className:
        'bg-[#F4EBFF] dark:bg-[#7E22CE]/10 text-[#7E22CE] dark:text-[#C084FC]',
    },
    reversed: {
      label: 'Refund',
      className:
        'bg-[#F4EBFF] dark:bg-[#7E22CE]/10 text-[#7E22CE] dark:text-[#C084FC]',
    },
  };
  return (
    map[s] ?? {
      label: status.charAt(0).toUpperCase() + status.slice(1),
      className:
        'bg-[#EAECF0] dark:bg-gray-800 text-[#475467] dark:text-gray-300',
    }
  );
};

// Type pill: coloured by money direction so the column scans at a glance.
// Money-in (credit/fund) reads green/blue, money-out (debit) red, reversals
// (refund) purple — same palette language as the status pills above.
export const transactionTypeBadge = (type: string): TransactionBadge => {
  const t = type.toLowerCase().replace(/[\s-]+/g, '_');
  const map: Record<string, TransactionBadge> = {
    // Earnings released into the wallet — money in.
    credit: {
      label: 'Credit',
      className:
        'bg-[#E7F6EC] dark:bg-[#0F973D]/10 text-[#0F973D] dark:text-[#4ADE80]',
    },
    earning: {
      label: 'Credit',
      className:
        'bg-[#E7F6EC] dark:bg-[#0F973D]/10 text-[#0F973D] dark:text-[#4ADE80]',
    },
    // Wallet top-up — money in, but distinct from earnings.
    fund: {
      label: 'Funding',
      className:
        'bg-[#E3EFFC] dark:bg-[#1671D9]/10 text-[#1671D9] dark:text-[#60A5FA]',
    },
    funding: {
      label: 'Funding',
      className:
        'bg-[#E3EFFC] dark:bg-[#1671D9]/10 text-[#1671D9] dark:text-[#60A5FA]',
    },
    // Payout / withdrawal — money out.
    debit: {
      label: 'Debit',
      className:
        'bg-[#FBEAE9] dark:bg-[#D42620]/10 text-[#D42620] dark:text-[#F87171]',
    },
    // Reversed earning — money out, flagged distinctly.
    refund: {
      label: 'Refund',
      className:
        'bg-[#F4EBFF] dark:bg-[#7E22CE]/10 text-[#7E22CE] dark:text-[#C084FC]',
    },
    reversed: {
      label: 'Refund',
      className:
        'bg-[#F4EBFF] dark:bg-[#7E22CE]/10 text-[#7E22CE] dark:text-[#C084FC]',
    },
  };
  return (
    map[t] ?? {
      label:
        type && type !== '—'
          ? type.charAt(0).toUpperCase() + type.slice(1)
          : '—',
      className:
        'bg-[#EAECF0] dark:bg-gray-800 text-[#475467] dark:text-gray-300',
    }
  );
};

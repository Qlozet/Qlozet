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

// Status pill: label + colour classes, matching the design.
export interface TransactionBadge {
  label: string;
  className: string;
}

export const transactionBadge = (status: string): TransactionBadge => {
  const s = status.toLowerCase().replace(/[\s-]+/g, '_');
  const map: Record<string, TransactionBadge> = {
    pending: { label: 'Pending', className: 'bg-[#FEF6E7] text-[#DD900D]' },
    processing: { label: 'Pending', className: 'bg-[#FEF6E7] text-[#DD900D]' },
    in_review: { label: 'Pending', className: 'bg-[#FEF6E7] text-[#DD900D]' },
    successful: { label: 'Successful', className: 'bg-[#E7F6EC] text-[#0F973D]' },
    success: { label: 'Successful', className: 'bg-[#E7F6EC] text-[#0F973D]' },
    completed: { label: 'Successful', className: 'bg-[#E7F6EC] text-[#0F973D]' },
    failed: { label: 'Failed', className: 'bg-[#FBEAE9] text-[#D42620]' },
    cancelled: { label: 'Failed', className: 'bg-[#FBEAE9] text-[#D42620]' },
    refund: { label: 'Refund', className: 'bg-[#F4EBFF] text-[#7E22CE]' },
    refunded: { label: 'Refund', className: 'bg-[#F4EBFF] text-[#7E22CE]' },
    reversed: { label: 'Refund', className: 'bg-[#F4EBFF] text-[#7E22CE]' },
  };
  return (
    map[s] ?? {
      label: status.charAt(0).toUpperCase() + status.slice(1),
      className: 'bg-[#EAECF0] text-[#475467]',
    }
  );
};

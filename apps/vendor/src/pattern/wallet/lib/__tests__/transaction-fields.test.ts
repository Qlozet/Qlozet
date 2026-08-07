import { describe, expect, it } from 'vitest';
import type { VendorTransaction } from '@/redux/services/wallet/wallet.api-slice';
import {
  formatDate,
  formatNaira,
  readAmount,
  readBalanceAfter,
  readBalanceBefore,
  readNarration,
  readSender,
  readSenderAccount,
  readStatus,
  readTransactionDate,
  readTransactionId,
  readTransactionType,
  transactionBadge,
  transactionTypeBadge,
} from '../transaction-fields';

const tx = (patch: Record<string, unknown> = {}) =>
  patch as unknown as VendorTransaction;

describe('formatters', () => {
  it('formats money, including zero', () => {
    expect(formatNaira(20000)).toBe('NGN 20,000');
    expect(formatNaira(0)).toBe('NGN 0');
    expect(formatNaira(undefined)).toBe('—');
    expect(formatNaira(Number.NaN)).toBe('—');
  });

  it('formats a date as zero-padded DD/MM/YYYY', () => {
    expect(formatDate('2023-07-23T12:00:00.000Z')).toBe('23/07/2023');
  });

  it('echoes an unparseable date and dashes a missing one', () => {
    expect(formatDate('soon')).toBe('soon');
    expect(formatDate(undefined)).toBe('—');
    expect(formatDate('   ')).toBe('—');
  });
});

describe('field readers', () => {
  it('reads the date across every key the API uses', () => {
    expect(readTransactionDate(tx({ createdAt: 'a' }))).toBe('a');
    expect(readTransactionDate(tx({ date: 'b' }))).toBe('b');
    expect(readTransactionDate(tx({ transaction_date: 'c' }))).toBe('c');
    expect(readTransactionDate(tx({ transactionDate: 'd' }))).toBe('d');
  });

  it('reads the id, preferring the human reference over the mongo id', () => {
    expect(readTransactionId(tx({ transactionId: 'T1', _id: 'x' }))).toBe('T1');
    expect(readTransactionId(tx({ reference: 'R1', _id: 'x' }))).toBe('R1');
    expect(readTransactionId(tx({ _id: 'x' }))).toBe('x');
    expect(readTransactionId(tx({}))).toBe('—');
  });

  it('reads the type across the API spellings', () => {
    expect(readTransactionType(tx({ transType: 'credit' }))).toBe('credit');
    expect(readTransactionType(tx({ transaction_type: 'debit' }))).toBe('debit');
    expect(readTransactionType(tx({ type: 'fund' }))).toBe('fund');
    expect(readTransactionType(tx({}))).toBe('—');
  });

  it('falls back to "Nil" for a missing narration', () => {
    expect(readNarration(tx({ narration: 'Payout' }))).toBe('Payout');
    expect(readNarration(tx({ description: 'Payout' }))).toBe('Payout');
    expect(readNarration(tx({}))).toBe('Nil');
  });

  it('coerces a numeric-string amount, and keeps zero', () => {
    expect(readAmount(tx({ amount: 5000 }))).toBe(5000);
    expect(readAmount(tx({ amount: '5000' }))).toBe(5000);
    expect(readAmount(tx({ amount: 0 }))).toBe(0);
    expect(readAmount(tx({ value: 100 }))).toBe(100);
    expect(readAmount(tx({ amount: 'abc' }))).toBeUndefined();
    expect(readAmount(tx({}))).toBeUndefined();
  });

  it('lower-cases the status and defaults to pending', () => {
    expect(readStatus(tx({ status: 'SUCCESSFUL' }))).toBe('successful');
    expect(readStatus(tx({}))).toBe('pending');
  });

  it('reads the balances across the API spellings', () => {
    expect(readBalanceBefore(tx({ balanceBefore: 10 }))).toBe(10);
    expect(readBalanceBefore(tx({ balance_before: 20 }))).toBe(20);
    expect(readBalanceAfter(tx({ balanceAfter: 30 }))).toBe(30);
    expect(readBalanceAfter(tx({ balance_after: 40 }))).toBe(40);
    expect(readBalanceBefore(tx({}))).toBeUndefined();
  });
});

describe('sender details', () => {
  it('reads a sender name, flat or nested', () => {
    expect(readSender(tx({ sender: 'Ada' }))).toBe('Ada');
    expect(readSender(tx({ sender_name: 'Ada' }))).toBe('Ada');
    expect(readSender(tx({ sender: { name: 'Ada' } }))).toBe('Ada');
    expect(readSender(tx({}))).toBe('—');
  });

  it('combines account number and bank', () => {
    expect(
      readSenderAccount(tx({ senderAccountNumber: '3109876543', senderBank: 'Firstbank' }))
    ).toBe('3109876543 - Firstbank');
  });

  it('shows whichever half is available', () => {
    expect(readSenderAccount(tx({ sender_account_number: '3109876543' }))).toBe(
      '3109876543'
    );
    expect(readSenderAccount(tx({ bankName: 'GTB' }))).toBe('GTB');
    expect(readSenderAccount(tx({}))).toBe('—');
  });
});

describe('transactionBadge', () => {
  it('collapses the in-flight statuses to Pending', () => {
    for (const s of ['pending', 'processing', 'in_review']) {
      expect(transactionBadge(s).label).toBe('Pending');
    }
  });

  it('collapses the settled statuses to Successful', () => {
    for (const s of ['successful', 'success', 'completed']) {
      expect(transactionBadge(s).label).toBe('Successful');
    }
  });

  it('collapses failures and reversals', () => {
    expect(transactionBadge('failed').label).toBe('Failed');
    expect(transactionBadge('cancelled').label).toBe('Failed');
    expect(transactionBadge('reversed').label).toBe('Refund');
  });

  it('normalises spaces and hyphens before matching', () => {
    expect(transactionBadge('IN REVIEW').label).toBe('Pending');
    expect(transactionBadge('in-review').label).toBe('Pending');
  });

  it('capitalises an unknown status instead of rendering nothing', () => {
    const badge = transactionBadge('queued');
    expect(badge.label).toBe('Queued');
    expect(badge.className).toBeTruthy();
  });
});

describe('transactionTypeBadge', () => {
  it('labels money-in, money-out and reversals distinctly', () => {
    expect(transactionTypeBadge('credit').label).toBe('Credit');
    expect(transactionTypeBadge('earning').label).toBe('Credit');
    expect(transactionTypeBadge('fund').label).toBe('Funding');
    expect(transactionTypeBadge('debit').label).toBe('Debit');
    expect(transactionTypeBadge('refund').label).toBe('Refund');
  });

  // readTransactionType returns "—" when the API sent nothing; the badge must
  // not turn that into a type called "—".
  it('passes the em-dash placeholder through as-is', () => {
    expect(transactionTypeBadge('—').label).toBe('—');
    expect(transactionTypeBadge('').label).toBe('—');
  });

  it('capitalises an unknown type', () => {
    expect(transactionTypeBadge('chargeback').label).toBe('Chargeback');
  });
});

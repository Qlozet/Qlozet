// Mockup sample data for the wallet, used as a fallback so the page matches the
// populated design when the real endpoints return nothing in this environment.
// Mirrors the Orders approach (orders-sample.ts); replace with real data when
// the backend is available. The rows cover every Filter-menu status
// (Pending / Successful / Failed / Refund) so the filter is testable.

import type { TransactionRow } from './transaction-fields';

// Wallet Balance card fallback (GET /wallets/balance) — matches the design.
export const SAMPLE_WALLET_BALANCE = 10000;

interface SampleRow {
  _id: string;
  transactionId: string;
  createdAt: string;
  transType: 'Transfer' | 'Deposit';
  narration: string;
  amount: number;
  status: string;
}

const BASE_ROWS: SampleRow[] = [
  { _id: 't1', transactionId: 'AT123456778', createdAt: '2023-07-23', transType: 'Transfer', narration: 'Nil', amount: 20000, status: 'pending' },
  { _id: 't2', transactionId: 'AT123456654', createdAt: '2023-07-23', transType: 'Deposit', narration: 'Payment for Amasi dress and matching accessories', amount: 120000, status: 'failed' },
  { _id: 't3', transactionId: 'AT123456654', createdAt: '2023-07-23', transType: 'Deposit', narration: 'Amasi dress', amount: 120000, status: 'successful' },
  { _id: 't4', transactionId: 'AT123456654', createdAt: '2023-07-23', transType: 'Transfer', narration: 'Amasi dress', amount: 120000, status: 'successful' },
  { _id: 't5', transactionId: 'AT123456654', createdAt: '2023-07-23', transType: 'Transfer', narration: 'Amasi dress', amount: 120000, status: 'successful' },
  { _id: 't6', transactionId: 'AT123456654', createdAt: '2023-07-23', transType: 'Transfer', narration: 'Amasi dress', amount: 120000, status: 'successful' },
  { _id: 't7', transactionId: 'AT123456655', createdAt: '2023-07-22', transType: 'Deposit', narration: 'Wallet top-up', amount: 50000, status: 'successful' },
  { _id: 't8', transactionId: 'AT123456656', createdAt: '2023-07-22', transType: 'Transfer', narration: 'Refund for cancelled order', amount: 45000, status: 'refund' },
  { _id: 't9', transactionId: 'AT123456657', createdAt: '2023-07-21', transType: 'Transfer', narration: 'Payout to bank', amount: 200000, status: 'pending' },
  { _id: 't10', transactionId: 'AT123456658', createdAt: '2023-07-21', transType: 'Deposit', narration: 'Ankara set', amount: 75000, status: 'successful' },
  { _id: 't11', transactionId: 'AT123456659', createdAt: '2023-07-20', transType: 'Transfer', narration: 'Nil', amount: 15000, status: 'failed' },
  { _id: 't12', transactionId: 'AT123456660', createdAt: '2023-07-20', transType: 'Deposit', narration: 'Agbada order', amount: 320000, status: 'successful' },
  { _id: 't13', transactionId: 'AT123456661', createdAt: '2023-07-19', transType: 'Transfer', narration: 'Refund for damaged item', amount: 60000, status: 'refund' },
  { _id: 't14', transactionId: 'AT123456662', createdAt: '2023-07-19', transType: 'Deposit', narration: 'Aso-ebi bundle', amount: 180000, status: 'successful' },
  { _id: 't15', transactionId: 'AT123456663', createdAt: '2023-07-18', transType: 'Transfer', narration: 'Payout to bank', amount: 90000, status: 'pending' },
];

// A few senders to rotate through so the detail modal isn't identical per row.
const SENDERS = [
  { name: 'Kola Olushola', account: '3109876543', bank: 'Firstbank' },
  { name: 'Amaka Obi', account: '2087654321', bank: 'GTBank' },
  { name: 'Tunde Bakare', account: '0123456789', bank: 'Access Bank' },
  { name: 'Ngozi Eze', account: '3344556677', bank: 'UBA' },
];

// Simulate a running wallet balance so each row's before/after is internally
// consistent. Starts at 200,000 so the first row reads 200,000 → 180,000, which
// matches the Transaction-details design mockup.
let running = 200000;

export const SAMPLE_TRANSACTIONS: TransactionRow[] = BASE_ROWS.map((row, i) => {
  const before = running;
  const after =
    row.transType === 'Deposit'
      ? before + row.amount
      : Math.max(0, before - row.amount);
  running = after;
  const sender = SENDERS[i % SENDERS.length];
  return {
    ...row,
    sender: sender.name,
    senderAccountNumber: sender.account,
    senderBank: sender.bank,
    balanceBefore: before,
    balanceAfter: after,
  };
});

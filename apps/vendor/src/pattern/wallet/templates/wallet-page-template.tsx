'use client';

// Wallet Page Template
// Vendor wallet: headline cards (balance + total received) with Send money /
// Fund wallet actions, and a "Recent Transactions" table. Balance comes from
// GET /wallets/balance and transactions from GET /transactions/vendor.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import NiceModal from '@ebay/nice-modal-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { PaginationState } from '@tanstack/react-table';
import { toast } from 'sonner';
import {
  useGetWalletBalanceQuery,
  useGetWalletTransactionsQuery,
  useLazyVerifyWalletPaymentQuery,
} from '@/redux/services/wallet/wallet.api-slice';
import { DataTable } from '@/pattern/common/organisms/table/data-table';
import { TableToolbar } from '@/pattern/common/molecules/table-toolbar';
import { WalletStatsSection } from '../molecules/wallet-stats-section';
import { FundWalletModal } from '../organisms/fund-wallet-modal';
import { SendMoneyModal } from '../organisms/send-money-modal';
import { TransactionDetailsModal } from '../organisms/transaction-details-modal';
import { createTransactionColumns } from '../molecules/wallet-transactions-columns';
import {
  TransactionFilterMenu,
  type TransactionStatusFilter,
} from '../molecules/transaction-filter-menu';
import {
  formatDate,
  formatNaira,
  readAmount,
  readNarration,
  readStatus,
  readTransactionDate,
  readTransactionId,
  readTransactionType,
  transactionBadge,
  type TransactionRow,
} from '../lib/transaction-fields';

const PAGE_SIZE = 6;

// The balance response shape is undocumented — read the most likely keys.
const readBalance = (raw: unknown): number | undefined => {
  if (typeof raw === 'number') return raw;
  const d = (raw ?? {}) as Record<string, unknown>;
  for (const key of ['balance', 'availableBalance', 'available_balance', 'amount']) {
    if (typeof d[key] === 'number') return d[key] as number;
  }
  return undefined;
};

// The transactions envelope is undocumented — pull the row array from the most
// likely nesting.
const readTransactionList = (raw: unknown): TransactionRow[] => {
  if (Array.isArray(raw)) return raw as TransactionRow[];
  const d = (raw ?? {}) as Record<string, unknown>;
  const candidates = [d.data, d.transactions, d.results, d.items];
  for (const c of candidates) {
    if (Array.isArray(c)) return c as TransactionRow[];
  }
  // One extra level of nesting (e.g. { data: { data: [...] } }).
  const nested = (d.data ?? {}) as Record<string, unknown>;
  if (Array.isArray(nested.data)) return nested.data as TransactionRow[];
  return [];
};

const exportTransactionsToCsv = (rows: TransactionRow[]) => {
  const headers = [
    'Date',
    'Transaction ID',
    'Transaction type',
    'Narration',
    'Amount',
    'Status',
  ];
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const lines = rows.map((t) =>
    [
      formatDate(readTransactionDate(t)),
      readTransactionId(t),
      readTransactionType(t),
      readNarration(t),
      formatNaira(readAmount(t)),
      readStatus(t),
    ]
      .map((cell) => escape(String(cell)))
      .join(',')
  );
  const csv = [headers.map(escape).join(','), ...lines].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'wallet-transactions.csv';
  link.click();
  URL.revokeObjectURL(url);
};

export const WalletPageTemplate: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] =
    useState<TransactionStatusFilter>('all');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const {
    data: balanceData,
    isLoading: isBalanceLoading,
    refetch: refetchBalance,
  } = useGetWalletBalanceQuery();

  const {
    data: transactionsData,
    isLoading,
    isFetching,
    isSuccess,
    isError,
    error,
    refetch: refetchTransactions,
  } = useGetWalletTransactionsQuery({ status: 'all' });

  const [verifyPayment] = useLazyVerifyWalletPaymentQuery();

  // On return from Paystack checkout the URL carries `?reference=…&trxref=…`.
  // Verify it once, credit the wallet, refresh the data, then strip the params.
  const verifiedRef = useRef(false);
  useEffect(() => {
    const reference =
      searchParams.get('reference') ?? searchParams.get('trxref');
    if (!reference || verifiedRef.current) return;
    verifiedRef.current = true;

    (async () => {
      try {
        const res = await verifyPayment(reference).unwrap();
        toast.success(res?.message || 'Wallet funded successfully.');
        refetchBalance();
        refetchTransactions();
      } catch (err) {
        const message =
          (err as { data?: { message?: string } })?.data?.message ||
          'We could not verify your payment. Please contact support if you were charged.';
        toast.error(message);
      } finally {
        // Strip query params synchronously from the browser address bar
        // so a manual refresh doesn't trigger verification again.
        window.history.replaceState(null, '', pathname);
      }
    })();
  }, [
    searchParams,
    verifyPayment,
    refetchBalance,
    refetchTransactions,
    router,
    pathname,
  ]);

  // Real wallet balance (GET /wallets/balance). Undefined until it resolves, so
  // the card shows an honest "—" rather than a fabricated figure.
  const balance = readBalance(balanceData?.data);

  const transactions = useMemo(
    () => readTransactionList(transactionsData?.data),
    [transactionsData]
  );

  // The endpoint has no search param, so filter client-side across the fields
  // the design lets you scan, plus the status chosen in the Filter menu.
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return transactions.filter((t) => {
      const matchesStatus =
        statusFilter === 'all' ||
        transactionBadge(readStatus(t)).label.toLowerCase() === statusFilter;
      if (!matchesStatus) return false;
      if (!q) return true;
      return [readTransactionId(t), readTransactionType(t), readNarration(t)]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(q));
    });
  }, [transactions, search, statusFilter]);

  // Reset to the first page whenever the search or status filter narrows the set.
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [search, statusFilter]);

  const openDetails = (transaction: TransactionRow) =>
    NiceModal.show(TransactionDetailsModal, { transaction });

  const handleExport = () => {
    if (filtered.length === 0) {
      toast.info('No transactions to export yet.');
      return;
    }
    exportTransactionsToCsv(filtered);
  };

  const columns = useMemo(() => createTransactionColumns(openDetails), []);

  return (
    <div className='w-full min-h-screen h-fit space-y-6 pb-10'>
      {/* Header: balance cards + actions */}
      <WalletStatsSection
        balance={balance}
        isLoading={isBalanceLoading}
        onSendMoney={() => NiceModal.show(SendMoneyModal)}
        onFundWallet={() => NiceModal.show(FundWalletModal)}
      />

      {/* Recent transactions */}
      <div id='recent-transactions'>
        <DataTable
          columns={columns}
          data={filtered}
          isLoading={isLoading}
          isFetching={isFetching}
          isSuccess={isSuccess}
          isError={isError}
          error={error}
          pagination={pagination}
          setPagination={setPagination}
          emptyMessage='No transactions yet.'
          minWidth='980px'
          toolbar={
            <TableToolbar
              title='Recent Transactions'
              search={search}
              onSearchChange={setSearch}
              filterControl={
                <TransactionFilterMenu
                  value={statusFilter}
                  onChange={setStatusFilter}
                />
              }
              onExport={handleExport}
            />
          }
        />
      </div>
    </div>
  );
};

export default WalletPageTemplate;

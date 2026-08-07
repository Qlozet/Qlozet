'use client';

import { useEffect, useMemo, useState } from 'react';
import NiceModal from '@ebay/nice-modal-react';
import type { PaginationState } from '@tanstack/react-table';
import { toast } from 'sonner';
import { DataTable } from '@/pattern/common/organisms/table/data-table';
import { TableToolbar } from '@/pattern/common/molecules/table-toolbar';
import { downloadCsv, toCsv } from '@/lib/csv';
import { formatDate } from '@/lib/customers';
import { TransactionDetailModal } from './transaction-detail-modal';
import { useGetCustomerTransactionsQuery } from '@/redux/services/transactions/transactions.api-slice';
import { createCustomerTransactionsColumns } from '../molecules/customer-transactions-columns';

const PAGE_SIZE = 5;

export const CustomerTransactionsTable = () => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, isFetching, isSuccess, isError, error } =
    useGetCustomerTransactionsQuery({
      status: '',
      page: pagination.pageIndex + 1,
      size: pagination.pageSize,
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
    });

  const paginated = data?.data;
  const transactions = useMemo(() => paginated?.data ?? [], [paginated]);
  const totalCount =
    paginated?.totalCount ?? paginated?.total ?? transactions.length;
  const pageCount = Math.max(Math.ceil(totalCount / pagination.pageSize), 1);

  // No date filter: the transactions endpoint takes no date params, and the
  // list is already scoped to this customer.
  const handleExport = () => {
    if (transactions.length === 0) {
      toast.info('There are no transactions to export.');
      return;
    }
    downloadCsv(
      'customer-transactions.csv',
      toCsv(
        ['Date', 'Transaction ID', 'Type', 'Narration', 'Amount', 'Status'],
        transactions.map((t) => [
          formatDate(t.createdAt),
          t.transactionId || t.reference || t._id,
          t.type ?? '—',
          t.narration || t.description || '—',
          typeof t.amount === 'number'
            ? `${t.currency || 'NGN'} ${t.amount}`
            : '—',
          t.status ?? '—',
        ])
      )
    );
  };

  // No per-transaction endpoint exists; the modal renders the record this list
  // already returned.
  const columns = useMemo(
    () =>
      createCustomerTransactionsColumns({
        onViewDetails: (transaction) =>
          NiceModal.show(TransactionDetailModal, { transaction }),
      }),
    []
  );

  return (
    <DataTable
      columns={columns}
      data={transactions}
      isLoading={isLoading}
      isFetching={isFetching}
      isSuccess={isSuccess}
      isError={isError}
      error={error}
      pagination={pagination}
      setPagination={setPagination}
      pageCount={pageCount}
      toolbar={
        <TableToolbar
          title="Recent Transactions"
          search={search}
          onSearchChange={setSearch}
          onExport={handleExport}
          showFilter={false}
          filterLabel="Filter By :"
          filterIcon={null}
        />
      }
      emptyMessage="No transactions found."
      loadingMessage="Loading transactions..."
    />
  );
};

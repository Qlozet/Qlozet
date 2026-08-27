'use client';

import { useMemo, useState } from 'react';
import NiceModal from '@ebay/nice-modal-react';
import type { PaginationState } from '@tanstack/react-table';
import { toast } from 'sonner';
import { DataTable } from '@/pattern/common/organisms/table/data-table';
import { TableToolbar } from '@/pattern/common/molecules/table-toolbar';
import { downloadCsv, toCsv } from '@/lib/csv';
import { formatDate } from '@/lib/customers';
import { readPageCount, readTotalItems } from '@/redux/services/types';
import { TransactionDetailModal } from './transaction-detail-modal';
import { useGetCustomerTransactionsQuery } from '@/redux/services/customers/customers.api-slice';
import { createCustomerTransactionsColumns } from '../molecules/customer-transactions-columns';

const PAGE_SIZE = 5;

// This customer's transactions, from GET /admin/customer/:id/transactions.
// It previously called /transactions/customer, which is scoped to the caller,
// so an admin saw their own rows on every customer's page.
export const CustomerTransactionsTable = ({
  customerId,
}: {
  customerId: string;
}) => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });

  const { data, isLoading, isFetching, isSuccess, isError, error } =
    useGetCustomerTransactionsQuery(
      {
        customerId,
        page: pagination.pageIndex + 1,
        size: pagination.pageSize,
      },
      { skip: !customerId }
    );

  const paginated = data?.data;
  const transactions = useMemo(() => paginated?.data ?? [], [paginated]);
  const pageCount = readPageCount(paginated, pagination.pageSize);
  const totalRows = readTotalItems(paginated);

  // No search or date control: the endpoint takes page and size only, and the
  // list is already scoped to this customer. A box that filtered nothing but
  // the page in front of you would be worse than none.
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
      totalRows={totalRows}
      toolbar={
        <TableToolbar
          title="Recent Transactions"
          onExport={handleExport}
          showFilter={false}
          showSearch={false}
        />
      }
      emptyMessage="No transactions found."
      loadingMessage="Loading transactions..."
    />
  );
};

'use client';

import { useEffect, useMemo, useState } from 'react';
import NiceModal from '@ebay/nice-modal-react';
import type { PaginationState } from '@tanstack/react-table';
import { WorkInProgressModal } from '@/pattern/common/organisms/work-in-progress-modal';
import { DataTable } from '@/pattern/common/organisms/table/data-table';
import { TableToolbar } from '@/pattern/common/molecules/table-toolbar';
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

  const showWip = () => NiceModal.show(WorkInProgressModal);

  const columns = useMemo(
    () => createCustomerTransactionsColumns({ onViewDetails: showWip }),
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
          onFilterDate={showWip}
          onExport={showWip}
          filterLabel="Filter By :"
          filterIcon={null}
        />
      }
      emptyMessage="No transactions found."
      loadingMessage="Loading transactions..."
    />
  );
};

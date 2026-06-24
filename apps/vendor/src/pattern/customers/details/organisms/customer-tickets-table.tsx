'use client';

import { useMemo, useState } from 'react';
import type { PaginationState } from '@tanstack/react-table';
import { toast } from 'sonner';
import { DataTable } from '@/pattern/common/organisms/table/data-table';
import { TableToolbar } from '@/pattern/common/molecules/table-toolbar';
import { useGetTicketsQuery } from '@/redux/services/tickets/tickets.api-slice';
import { createCustomerTicketsColumns } from '../molecules/customer-tickets-columns';

const PAGE_SIZE = 7;

// NOTE: the backend Tickets endpoint has no customer filter, so this shows the
// vendor's tickets rather than ones scoped to this customer. When the API adds
// a customer filter, pass it into useGetTicketsQuery below.
export const CustomerTicketsTable = () => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });
  const [search, setSearch] = useState('');

  const { data, isLoading, isFetching, isSuccess, isError, error } =
    useGetTicketsQuery({
      page: pagination.pageIndex + 1,
      size: pagination.pageSize,
      search: search || undefined,
    });

  const notReady = () => toast.info('This action is coming soon.');

  const columns = useMemo(
    () => createCustomerTicketsColumns({ onViewDetails: notReady }),
    []
  );

  const paginated = data?.data;
  const rows = useMemo(() => paginated?.data ?? [], [paginated]);
  const totalCount =
    paginated?.totalCount ?? paginated?.total ?? rows.length;
  const pageCount = Math.max(Math.ceil(totalCount / pagination.pageSize), 1);

  return (
    <DataTable
      columns={columns}
      data={rows}
      isLoading={isLoading}
      isFetching={isFetching}
      isSuccess={isSuccess}
      isError={isError}
      error={error}
      pagination={pagination}
      setPagination={setPagination}
      pageCount={pageCount}
      totalCount={totalCount}
      manualPagination
      emptyMessage='No tickets yet.'
      toolbar={
        <TableToolbar
          title='Tickets'
          search={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPagination((prev) => ({ ...prev, pageIndex: 0 }));
          }}
          onFilterDate={notReady}
          onExport={notReady}
        />
      }
    />
  );
};

'use client';

import { useMemo, useState } from 'react';
import NiceModal from '@ebay/nice-modal-react';
import type { PaginationState } from '@tanstack/react-table';
import { WorkInProgressModal } from '@/pattern/common/organisms/work-in-progress-modal';
import { DataTable } from '@/pattern/common/organisms/table/data-table';
import { TableToolbar } from '@/pattern/common/molecules/table-toolbar';
import { useGetTicketsQuery } from '@/redux/services/tickets/tickets.api-slice';
import { createCustomerTicketsColumns } from '../molecules/customer-tickets-columns';

const PAGE_SIZE = 7;

export const CustomerTicketsTable = ({
  customerId,
}: {
  customerId: string;
}) => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });
  const [search, setSearch] = useState('');

  const { data, isLoading, isFetching, isSuccess, isError, error } =
    useGetTicketsQuery({
      customer_id: customerId || undefined,
      page: pagination.pageIndex + 1,
      size: pagination.pageSize,
      search: search || undefined,
    });

  const showWip = () => NiceModal.show(WorkInProgressModal);

  const columns = useMemo(
    () => createCustomerTicketsColumns({ onViewDetails: showWip }),
    []
  );

  const rows = data?.data?.data ?? [];
  const totalCount = data?.data?.totalCount ?? data?.data?.total ?? rows.length;
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
      emptyMessage="No tickets yet."
      loadingMessage="Loading tickets..."
      toolbar={
        <TableToolbar
          title="Tickets"
          search={search}
          onSearchChange={setSearch}
          onFilterDate={showWip}
          onExport={showWip}
        />
      }
    />
  );
};

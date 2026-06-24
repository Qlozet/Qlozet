'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { PaginationState } from '@tanstack/react-table';
import { toast } from 'sonner';
import { DataTable } from '@/pattern/common/organisms/table/data-table';
import { TableToolbar } from '@/pattern/common/molecules/table-toolbar';
import { APP_ROUTES } from '@/lib/routes';
import {
  useGetTicketsQuery,
  type Ticket,
} from '@/redux/services/tickets/tickets.api-slice';
import { createSupportTicketsColumns } from '../molecules/support-tickets-columns';

const PAGE_SIZE = 8;

export const SupportTicketsTable = () => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });
  const [search, setSearch] = useState('');
  const router = useRouter();

  const { data, isLoading, isFetching, isSuccess, isError, error } =
    useGetTicketsQuery({
      page: pagination.pageIndex + 1,
      size: pagination.pageSize,
      search: search || undefined,
    });

  // Filter/Export have no backend yet — surface an honest "coming soon" toast.
  const notReady = () => toast.info('This action is coming soon.');
  const openTicket = (ticket: Ticket) =>
    router.push(`${APP_ROUTES.support}/${encodeURIComponent(ticket._id)}`);

  const columns = useMemo(() => createSupportTicketsColumns(), []);

  const paginated = data?.data;
  const rows = useMemo(() => paginated?.data ?? [], [paginated]);
  const totalCount = paginated?.totalCount ?? paginated?.total ?? rows.length;
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
      onRowClick={openTicket}
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

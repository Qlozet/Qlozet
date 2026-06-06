'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import NiceModal from '@ebay/nice-modal-react';
import type { PaginationState } from '@tanstack/react-table';
import { WorkInProgressModal } from '@/pattern/common/organisms/work-in-progress-modal';
import { DataTable } from '@/pattern/common/organisms/table/data-table';
import { TableToolbar } from '@/pattern/common/molecules/table-toolbar';
import { APP_ROUTES } from '@/lib/routes';
import {
  useGetTicketsQuery,
  type Ticket,
} from '@/redux/services/tickets/tickets.api-slice';
import { createSupportTicketsColumns } from '../molecules/support-tickets-columns';
import { USE_SUPPORT_MOCKS, MOCK_TICKETS } from '../lib/mock-data';

const PAGE_SIZE = 8;

export const TicketsTable = () => {
  const router = useRouter();
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

  // No admin create-ticket endpoint yet — Add/Filter/Export surface the shared
  // "work in progress" modal (matching the customer tickets table).
  const showWip = () => NiceModal.show(WorkInProgressModal);
  const openTicket = (ticket: Ticket) =>
    router.push(`${APP_ROUTES.support}/${ticket._id}`);

  const columns = useMemo(() => createSupportTicketsColumns(), []);

  const rows = USE_SUPPORT_MOCKS ? MOCK_TICKETS : data?.data?.data ?? [];
  const totalCount = USE_SUPPORT_MOCKS
    ? rows.length
    : data?.data?.totalCount ?? data?.data?.total ?? rows.length;
  const pageCount = Math.max(Math.ceil(totalCount / pagination.pageSize), 1);

  return (
    <DataTable
      columns={columns}
      data={rows}
      isLoading={USE_SUPPORT_MOCKS ? false : isLoading}
      isFetching={USE_SUPPORT_MOCKS ? false : isFetching}
      isSuccess={USE_SUPPORT_MOCKS ? true : isSuccess}
      isError={USE_SUPPORT_MOCKS ? false : isError}
      error={error}
      pagination={pagination}
      setPagination={setPagination}
      pageCount={pageCount}
      onRowClick={openTicket}
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

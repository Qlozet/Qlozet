'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { PaginationState } from '@tanstack/react-table';
import { DataTable } from '@/pattern/common/organisms/table/data-table';
import { TableToolbar } from '@/pattern/common/molecules/table-toolbar';
import { toast } from 'sonner';
import { APP_ROUTES } from '@/lib/routes';
import { downloadCsv, toCsv } from '@/lib/csv';
import {
  formatDate,
  shortTicketId,
  statusLabel,
  ticketCategory,
  ticketSubject,
} from '@/pattern/support/lib/ticket-fields';
import { readPageCount } from '@/redux/services/types';
import { useGetTicketsQuery } from '@/redux/services/tickets/tickets.api-slice';
import { createCustomerTicketsColumns } from '../molecules/customer-tickets-columns';

const PAGE_SIZE = 7;

export const CustomerTicketsTable = ({
  customerId,
}: {
  customerId: string;
}) => {
  const router = useRouter();
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

  // The ticket detail page already exists — send the row there instead of
  // dead-ending on a modal.
  const columns = useMemo(
    () =>
      createCustomerTicketsColumns({
        onViewDetails: (id: string) =>
          router.push(`${APP_ROUTES.support}/${id}`),
      }),
    [router]
  );

  const rows = data?.data?.data ?? [];
  const pageCount = readPageCount(data?.data, pagination.pageSize);

  // No date filter: /admin/tickets filters on createdAt, but this table is
  // already narrowed to one customer and the endpoint ignores customer_id, so a
  // date control here would imply a precision the data doesn't have.
  const handleExport = () => {
    if (rows.length === 0) {
      toast.info('There are no tickets to export.');
      return;
    }
    downloadCsv(
      'customer-tickets.csv',
      toCsv(
        ['Ticket ID', 'Category', 'Subject', 'Status', 'Created At'],
        rows.map((ticket) => [
          shortTicketId(ticket._id),
          ticketCategory(ticket),
          ticketSubject(ticket),
          statusLabel(ticket.status),
          formatDate(ticket.createdAt),
        ])
      )
    );
  };

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
          onExport={handleExport}
          showFilter={false}
        />
      }
    />
  );
};

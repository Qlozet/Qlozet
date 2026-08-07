'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { PaginationState } from '@tanstack/react-table';
import { toast } from 'sonner';
import { DataTable } from '@/pattern/common/organisms/table/data-table';
import { TableToolbar } from '@/pattern/common/molecules/table-toolbar';
import {
  DateRangeFilter,
  EMPTY_DATE_RANGE,
  toEndIso,
  toStartIso,
  type DateRange,
} from '@/pattern/common/molecules/date-range-filter';
import { downloadCsv, toCsv } from '@/lib/csv';
import { APP_ROUTES } from '@/lib/routes';
import { readPageCount } from '@/redux/services/types';
import {
  useGetTicketsQuery,
  type Ticket,
} from '@/redux/services/tickets/tickets.api-slice';
import { createSupportTicketsColumns } from '../molecules/support-tickets-columns';
import {
  assigneeId,
  formatDate,
  shortTicketId,
  statusLabel,
  ticketCategory,
  ticketSubject,
} from '../lib/ticket-fields';
import { useBusinessNames } from '../lib/use-business-names';

const PAGE_SIZE = 8;

const CSV_HEADERS = [
  'Ticket ID',
  'Subject',
  'User/Vendor Name',
  'Category',
  'Assigned To',
  'Status',
  'Replies',
  'Created At',
];

export const TicketsTable = () => {
  const router = useRouter();
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [dateRange, setDateRange] = useState<DateRange>(EMPTY_DATE_RANGE);

  // Debounce so typing in the toolbar doesn't fire a request per keystroke.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Any filter change invalidates the current page offset.
  useEffect(() => {
    setPagination((prev) =>
      prev.pageIndex === 0 ? prev : { ...prev, pageIndex: 0 }
    );
  }, [debouncedSearch, dateRange]);

  const queryArgs = {
    page: pagination.pageIndex + 1,
    size: pagination.pageSize,
    search: debouncedSearch || undefined,
    // Widened to full-day instants — a bare end date excludes that day.
    start_date: toStartIso(dateRange.start),
    end_date: toEndIso(dateRange.end),
  };

  const { data, isLoading, isFetching, isSuccess, isError, error } =
    useGetTicketsQuery(queryArgs);

  // Tickets reference their vendor by id only, so names are joined in here.
  const { businessName } = useBusinessNames();

  const rows = useMemo(() => data?.data?.data ?? [], [data]);

  // The backend paginates with `total_pages` / `total_items`; reading the
  // camelCase keys the shared type used to assume collapsed this to one page.
  const pageCount = readPageCount(data?.data, pagination.pageSize);

  const openTicket = useCallback(
    (ticket: Ticket) => router.push(`${APP_ROUTES.support}/${ticket._id}`),
    [router]
  );

  const toCsvRow = useCallback(
    (ticket: Ticket) => [
      shortTicketId(ticket._id),
      ticketSubject(ticket),
      businessName(ticket.business),
      ticketCategory(ticket),
      assigneeId(ticket) ?? 'Unassigned',
      statusLabel(ticket.status),
      String(ticket.replies?.length ?? 0),
      formatDate(ticket.createdAt),
    ],
    [businessName]
  );

  // Exports the rows currently on screen (the list endpoint is paginated, so
  // there is no full result set held client-side to export).
  const handleExport = useCallback(() => {
    if (rows.length === 0) {
      toast.info('There are no tickets to export.');
      return;
    }
    downloadCsv('tickets.csv', toCsv(CSV_HEADERS, rows.map(toCsvRow)));
  }, [rows, toCsvRow]);

  const columns = useMemo(
    () => createSupportTicketsColumns({ businessName }),
    [businessName]
  );

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
      onRowClick={openTicket}
      emptyMessage="No tickets yet."
      loadingMessage="Loading tickets..."
      toolbar={
        <TableToolbar
          title="Tickets"
          search={search}
          onSearchChange={setSearch}
          onExport={handleExport}
          filterControl={
            <DateRangeFilter value={dateRange} onChange={setDateRange} />
          }
        />
      }
    />
  );
};

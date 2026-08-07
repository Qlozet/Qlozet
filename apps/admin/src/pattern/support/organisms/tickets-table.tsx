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
  type DateRange,
} from '@/pattern/common/molecules/date-range-filter';
import { downloadCsv, toCsv } from '@/lib/csv';
import { APP_ROUTES } from '@/lib/routes';
import {
  useGetTicketsQuery,
  type Ticket,
} from '@/redux/services/tickets/tickets.api-slice';
import { createSupportTicketsColumns } from '../molecules/support-tickets-columns';
import {
  formatDate,
  readAssigned,
  readField,
  readName,
  statusLabel,
} from '../lib/ticket-fields';

const PAGE_SIZE = 8;

const CSV_HEADERS = [
  'Ticket ID',
  'Subject',
  'User/Vendor Name',
  'Category',
  'Assigned To',
  'Status',
  'Created At',
];

const toCsvRow = (ticket: Ticket) => [
  readField(ticket, 'reference', 'ticket_id', '_id'),
  readField(ticket, 'subject', 'title', 'description'),
  readName(ticket),
  readField(ticket, 'category', 'issue_type'),
  readAssigned(ticket) ?? 'Unassigned',
  statusLabel(ticket.status),
  formatDate(ticket.createdAt ?? ticket.date),
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
    start_date: dateRange.start || undefined,
    end_date: dateRange.end || undefined,
  };

  const { data, isLoading, isFetching, isSuccess, isError, error } =
    useGetTicketsQuery(queryArgs);

  const rows = useMemo(() => data?.data?.data ?? [], [data]);
  const totalCount = data?.data?.totalCount ?? data?.data?.total ?? rows.length;
  const pageCount = Math.max(Math.ceil(totalCount / pagination.pageSize), 1);

  const openTicket = useCallback(
    (ticket: Ticket) => router.push(`${APP_ROUTES.support}/${ticket._id}`),
    [router]
  );

  // Exports the rows currently on screen (the list endpoint is paginated, so
  // there is no full result set held client-side to export).
  const handleExport = useCallback(() => {
    if (rows.length === 0) {
      toast.info('There are no tickets to export.');
      return;
    }
    downloadCsv('tickets.csv', toCsv(CSV_HEADERS, rows.map(toCsvRow)));
  }, [rows]);

  const columns = useMemo(() => createSupportTicketsColumns(), []);

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

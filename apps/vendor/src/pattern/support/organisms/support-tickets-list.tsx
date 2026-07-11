'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, ListFilter, Search, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  useGetTicketsQuery,
  type Ticket as TicketType,
} from '@/redux/services/tickets/tickets.api-slice';
import { formatDateTime, readField } from '../lib/ticket-fields';

const PAGE_SIZE = 5;

const ICON_BG = ['#3387CC', '#E8A33D', '#E4572E', '#2EA86A', '#8B5CF6'];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'pending', label: 'Pending' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

const ticketRef = (t: TicketType): string => {
  const ref = readField(t, 'reference', 'ticket_id');
  const value = ref !== '—' ? ref : t._id;
  return value.startsWith('#') ? value : `#${value}`;
};

interface SupportTicketsListProps {
  onAddTicket: () => void;
  onViewDetails: (id: string) => void;
}

export const SupportTicketsList = ({
  onAddTicket,
  onViewDetails,
}: SupportTicketsListProps) => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  const { data, isLoading, isFetching, isError, error } = useGetTicketsQuery({
    page,
    size: PAGE_SIZE,
    search: search || undefined,
    status: status === 'all' ? undefined : status,
  });

  const paginated = data?.data;
  const rows = useMemo(() => paginated?.data ?? [], [paginated]);
  const total = paginated?.totalCount ?? paginated?.total ?? rows.length;
  const showLoader = isLoading || isFetching;
  const errorMessage =
    (error as { data?: { message?: string } })?.data?.message ??
    'Something went wrong';

  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);
  const canPrev = page > 1;
  const canNext = page * PAGE_SIZE < total;

  return (
    <div className='overflow-hidden rounded-xl border bg-white custom-card-shadow'>
      {/* Toolbar */}
      <div className='flex flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between'>
        <h2 className='text-lg font-semibold text-grey-black'>Tickets</h2>

        <div className='flex flex-wrap items-center gap-3'>
          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
          >
            <SelectTrigger className='h-10 w-[170px] gap-2 text-sm text-gray-600 dark:text-gray-200 dark:bg-muted dark:border-white/10'>
              <ListFilter className='size-4' />
              <SelectValue placeholder='Filter By Status' />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className='relative'>
            <Search className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400' />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder='Search'
              className='h-10 w-full rounded-lg pl-9 sm:w-[220px]'
            />
          </div>

          <Button type='button' onClick={onAddTicket} className='h-10 gap-2'>
            Add Ticket
            <Plus className='size-4' />
          </Button>
        </div>
      </div>

      {/* List */}
      <div className='space-y-3 px-6 pb-2'>
        {showLoader &&
          Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <Skeleton key={`s-${i}`} className='h-[104px] w-full rounded-xl' />
          ))}

        {!showLoader &&
          rows.map((ticket, index) => (
            <div
              key={ticket._id}
              className='flex items-start gap-4 rounded-xl bg-[#F8F9FA] p-4'
            >
              <span
                className='flex size-9 shrink-0 items-center justify-center rounded-full text-white'
                style={{ backgroundColor: ICON_BG[index % ICON_BG.length] }}
              >
                <Ticket className='size-4' />
              </span>

              <div className='min-w-0 flex-1'>
                <p className='text-sm font-semibold text-grey-black'>
                  {ticketRef(ticket)}
                </p>
                <p className='text-xs text-grey2'>
                  {readField(ticket, 'category', 'issue_type')}
                </p>
                <p className='mt-1 line-clamp-2 max-w-[640px] text-sm text-grey3'>
                  {readField(ticket, 'description', 'message')}
                </p>
              </div>

              <div className='flex shrink-0 flex-col items-end gap-6'>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => onViewDetails(ticket._id)}
                  className='h-9 text-sm'
                >
                  View details
                </Button>
                <span className='whitespace-nowrap text-xs text-grey2'>
                  {formatDateTime(ticket.createdAt)}
                </span>
              </div>
            </div>
          ))}

        {!showLoader && !isError && rows.length === 0 && (
          <div className='flex min-h-[200px] items-center justify-center text-sm text-muted-foreground'>
            No tickets yet.
          </div>
        )}

        {!showLoader && isError && (
          <div className='flex min-h-[200px] flex-col items-center justify-center gap-1'>
            <p className='text-base font-medium text-destructive'>
              Error loading tickets
            </p>
            <p className='text-sm text-muted-foreground'>{errorMessage}</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!showLoader && !isError && total > 0 && (
        <div className='flex w-full items-center justify-end gap-x-4 py-4 pr-6'>
          <div className='text-sm text-muted-foreground'>
            Showing {from} - {to} of {total}
          </div>
          <Button
            className='size-6 rounded-full'
            variant='outline'
            size='icon'
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={!canPrev}
          >
            <ChevronLeft className={cn('size-4')} />
          </Button>
          <Button
            className='size-6 rounded-full'
            variant='outline'
            size='icon'
            onClick={() => setPage((p) => p + 1)}
            disabled={!canNext}
          >
            <ChevronRight className='size-4' />
          </Button>
        </div>
      )}
    </div>
  );
};

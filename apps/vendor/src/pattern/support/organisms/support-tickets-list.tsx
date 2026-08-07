'use client';

import { useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  ListFilter,
  MoreVertical,
  Search,
  Ticket,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import {
  formatDateTime,
  issueTypeLabel,
  readField,
} from '../lib/ticket-fields';

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
      <div className='flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between'>
        <h2 className='text-lg font-semibold text-grey-black'>Tickets</h2>

        {/* Mirrors the shared TableToolbar rhythm: below `sm` the buttons
            collapse to icons and the search takes the remaining width. */}
        <div className='flex w-full items-stretch gap-2 sm:gap-3 md:w-auto'>
          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
          >
            <SelectTrigger className='h-10 w-10 shrink-0 justify-center gap-2 px-0 text-sm text-gray-600 sm:w-fit sm:justify-between sm:px-3 max-sm:[&>svg:last-child]:hidden dark:text-gray-200 dark:bg-muted dark:border-white/10'>
              <ListFilter className='size-4 shrink-0' />
              {/* `!` is required: SelectTrigger's own `[&>span]:line-clamp-1`
                  forces `display:-webkit-box` on direct span children at a
                  higher specificity than a plain `hidden`. */}
              <span className='hidden! sm:inline!'>
                <SelectValue placeholder='Filter By Status' />
              </span>
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className='relative flex-1 sm:flex-none'>
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

          <Button
            type='button'
            onClick={onAddTicket}
            className='h-10 w-10 shrink-0 justify-center gap-2 px-0 sm:w-auto sm:px-4'
          >
            <span className='hidden sm:inline'>Add Ticket</span>
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
              role='button'
              tabIndex={0}
              onClick={() => onViewDetails(ticket._id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onViewDetails(ticket._id);
                }
              }}
              className='flex cursor-pointer items-start gap-4 rounded-xl bg-[#F8F9FA] p-4 transition-colors hover:bg-[#F1F2F4] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring'
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
                <p className='text-xs text-grey3'>
                  {issueTypeLabel(readField(ticket, 'category', 'issue_type'))}
                </p>
                <p className='max-md:mt-2 md:mt-5 line-clamp-2 max-w-160 text-sm text-grey3'>
                  {readField(ticket, 'description', 'message')}
                </p>
                {/* On mobile the date stacks under the description instead of
                    sitting in the (button-less) actions column. */}
                <span className='mt-2 block text-xs text-grey3 md:hidden'>
                  {formatDateTime(ticket.createdAt)}
                </span>
              </div>

              <div className='flex shrink-0 flex-col items-end gap-6'>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={(e) => {
                    // The whole card is clickable — don't navigate twice.
                    e.stopPropagation();
                    onViewDetails(ticket._id);
                  }}
                  className='h-9 cursor-pointer text-sm max-md:hidden'
                >
                  View details
                </Button>

                {/* Mobile: the row is already tappable, so the button gives way
                    to a kebab menu. */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type='button'
                      onClick={(e) => e.stopPropagation()}
                      aria-label='Ticket actions'
                      className='cursor-pointer p-1 text-grey3 md:hidden'
                    >
                      <MoreVertical className='size-4' />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem
                      onClick={() => onViewDetails(ticket._id)}
                      className='cursor-pointer'
                    >
                      View details
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <span className='whitespace-nowrap text-xs text-grey3 max-md:hidden'>
                  {formatDateTime(ticket.createdAt)}
                </span>
              </div>
            </div>
          ))}

        {!showLoader && !isError && rows.length === 0 && (
          <div className='flex min-h-50 items-center justify-center text-sm text-muted-foreground'>
            No tickets yet.
          </div>
        )}

        {!showLoader && isError && (
          <div className='flex min-h-50 flex-col items-center justify-center gap-1'>
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

'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Ticket } from '@/redux/services/tickets/tickets.api-slice';
import {
  EM_DASH,
  assigneeId,
  assigneeName,
  formatDate,
  shortTicketId,
  statusLabel,
  statusVariant,
  ticketCategory,
  ticketSubject,
  ticketRequesterName,
} from '../lib/ticket-fields';

interface SupportTicketsColumnsOptions {
  /** Resolves a ticket's `business` id to a vendor name. */
  businessName: (id?: string | null) => string;
}

/** Who raised the ticket — customers are personal, vendors are businesses. */
const requester = (
  t: Ticket,
  businessName: (id?: string | null) => string
): { name: string; origin: 'customer' | 'vendor' } => ({
  name: ticketRequesterName(t, businessName),
  origin: t.customer ? 'customer' : 'vendor',
});

export const createSupportTicketsColumns = ({
  businessName,
}: SupportTicketsColumnsOptions): ColumnDef<Ticket>[] => [
  {
    id: 'ticket_id',
    header: 'Ticket ID',
    cell: ({ row }) => (
      // `title` exposes the full ObjectId, since the cell only shows its tail.
      <span
        title={row.original._id}
        className="whitespace-nowrap text-sm font-medium text-grey-black dark:text-white"
      >
        {shortTicketId(row.original._id)}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: 'subject',
    header: 'Subject',
    cell: ({ row }) => (
      <span className="line-clamp-2 max-w-[320px] text-sm text-grey3 dark:text-gray-400">
        {ticketSubject(row.original)}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: 'name',
    header: 'Requester',
    cell: ({ row }) => {
      const r = requester(row.original, businessName);
      return (
        <span className="flex items-center gap-2 whitespace-nowrap">
          <span className="text-sm font-medium text-[#3387CC]">{r.name}</span>
          <span
            className={
              r.origin === 'customer'
                ? 'rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold uppercase text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                : 'rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
            }
          >
            {r.origin}
          </span>
        </span>
      );
    },
    enableSorting: false,
  },
  {
    id: 'category',
    header: 'Category',
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm text-grey3 dark:text-gray-400">
        {ticketCategory(row.original)}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: 'assigned_to',
    header: 'Assigned To',
    cell: ({ row }) => {
      // `assigned_to` refs a User and comes back populated, so this is the
      // admin's own name. A row that still carries a bare id falls back to a
      // short form of it rather than inventing a person.
      const id = assigneeId(row.original);
      const name = assigneeName(row.original);

      if (!id) {
        return (
          <span className="whitespace-nowrap text-sm text-error">
            Unassigned
          </span>
        );
      }

      return (
        <span
          title={id}
          className="whitespace-nowrap text-sm text-grey3 dark:text-gray-400"
        >
          {name ?? `#${id.slice(-6).toUpperCase()}`}
        </span>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Badge
        variant={statusVariant(row.original.status)}
        shape="square"
        className="flex h-[26px] w-fit items-center justify-center px-3 text-xs font-normal"
      >
        {statusLabel(row.original.status)}
      </Badge>
    ),
    enableSorting: false,
  },
  {
    id: 'replies',
    header: 'Replies',
    cell: ({ row }) => {
      const count = row.original.replies?.length ?? 0;
      return (
        <span className="whitespace-nowrap text-sm text-grey3 dark:text-gray-400">
          {count > 0 ? count : EM_DASH}
        </span>
      );
    },
    enableSorting: false,
  },
  {
    id: 'created_at',
    header: 'Created At',
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm text-grey3 dark:text-gray-400">
        {formatDate(row.original.createdAt)}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: 'chevron',
    header: '',
    cell: () => (
      <ChevronRight className="size-4 text-grey2 dark:text-gray-400" />
    ),
    enableSorting: false,
  },
];

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
} from '../lib/ticket-fields';

interface SupportTicketsColumnsOptions {
  /** Resolves a ticket's `business` id to a vendor name. */
  businessName: (id?: string | null) => string;
}

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
    header: 'User/Vendor Name',
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm font-medium text-[#3387CC]">
        {businessName(row.original.business)}
      </span>
    ),
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

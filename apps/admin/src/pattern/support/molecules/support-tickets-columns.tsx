'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Ticket } from '@/redux/services/tickets/tickets.api-slice';
import {
  formatDate,
  readAssigned,
  readField,
  readName,
  statusLabel,
  statusVariant,
} from '../lib/ticket-fields';

export const createSupportTicketsColumns = (): ColumnDef<Ticket>[] => [
  {
    id: 'ticket_id',
    header: 'Ticket ID',
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm font-medium text-grey-black">
        {readField(row.original, 'reference', 'ticket_id')}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: 'subject',
    header: 'Subject',
    cell: ({ row }) => (
      <span className="text-sm text-grey3">
        {readField(row.original, 'subject', 'title', 'description')}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: 'name',
    header: 'User/Vendor Name',
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm font-medium text-[#3387CC]">
        {readName(row.original)}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: 'category',
    header: 'Category',
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm text-grey3">
        {readField(row.original, 'category', 'issue_type')}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: 'assigned_to',
    header: 'Assigned To',
    cell: ({ row }) => {
      const assigned = readAssigned(row.original);
      return assigned ? (
        <span className="whitespace-nowrap text-sm text-grey3">{assigned}</span>
      ) : (
        <span className="whitespace-nowrap text-sm text-error">Unassigned</span>
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
    id: 'created_at',
    header: 'Created At',
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm text-grey3">
        {formatDate(row.original.createdAt ?? row.original.date)}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: 'chevron',
    header: '',
    cell: () => <ChevronRight className="size-4 text-grey2" />,
    enableSorting: false,
  },
];

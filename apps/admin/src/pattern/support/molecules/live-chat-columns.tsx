'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  formatDate,
  readAgent,
  readField,
  readName,
  statusLabel,
  statusVariant,
} from '../lib/ticket-fields';

// No backend yet for live chat — see live-chat-table.tsx TODO(api).
export interface LiveChatLog {
  _id?: string;
  status?: string;
  [key: string]: unknown;
}

export const createLiveChatColumns = (): ColumnDef<LiveChatLog>[] => [
  {
    id: 'ticket_id',
    header: 'Ticket ID',
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm font-medium text-grey-black">
        {readField(row.original, 'reference', 'chat_id', 'ticket_id')}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: 'last_message',
    header: 'Last Message',
    cell: ({ row }) => (
      <span className="line-clamp-2 max-w-[220px] text-sm text-grey3">
        {readField(row.original, 'last_message', 'message')}
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
    id: 'user_type',
    header: 'User Type',
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm text-grey3">
        {readField(row.original, 'user_type', 'sender_type')}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: 'chat_agent',
    header: 'Chat Agent / Bot',
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm text-grey3">
        {readAgent(row.original)}
      </span>
    ),
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

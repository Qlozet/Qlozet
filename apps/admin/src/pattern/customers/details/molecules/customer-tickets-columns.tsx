'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ShoppingBag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Ticket } from '@/redux/services/tickets/tickets.api-slice';
import {
  formatDate,
  shortTicketId,
  ticketCategory,
  ticketSubject,
} from '@/pattern/support/lib/ticket-fields';

const ICON_BG = [
  'bg-[#B42318]',
  'bg-[#E8A87C]',
  'bg-[#8B5CF6]',
  'bg-[#3387CC]',
  'bg-[#1A1A1A]',
  'bg-gray-400',
];

const statusVariant = (status?: string): 'success' | 'warning' | 'error' => {
  const s = (status ?? '').toLowerCase();
  if (['resolved', 'closed', 'completed'].includes(s)) return 'success';
  if (['rejected', 'failed'].includes(s)) return 'error';
  return 'warning';
};

const statusLabel = (status?: string): string => {
  if (!status) return 'Pending';
  return status.charAt(0).toUpperCase() + status.slice(1);
};

interface CustomerTicketsColumnsProps {
  onViewDetails: (id: string) => void;
}

export const createCustomerTicketsColumns = ({
  onViewDetails,
}: CustomerTicketsColumnsProps): ColumnDef<Ticket>[] => [
  {
    id: 'complaint',
    header: 'Complaint',
    cell: ({ row, table }) => {
      const t = row.original;
      const index = table.getRowModel().rows.findIndex((r) => r.id === row.id);
      return (
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'flex size-9 shrink-0 items-center justify-center rounded-full text-white',
              ICON_BG[index % ICON_BG.length]
            )}
          >
            <ShoppingBag className="size-4" />
          </div>
          <div className="flex flex-col gap-1">
            {/* Tickets carry no reference/subject fields — the id tail and the
                issue type stand in for them. */}
            <span className="text-sm font-semibold text-[hsla(210,9%,31%,1)]">
              {shortTicketId(t._id)}
            </span>
            <span className="text-xs text-gray-500">{ticketCategory(t)}</span>
            <span className="max-w-[420px] text-xs text-gray-500">
              {ticketSubject(t)}
            </span>
          </div>
        </div>
      );
    },
    enableSorting: false,
  },
  {
    id: 'date',
    header: 'Date',
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm text-gray-600">
        {formatDate(row.original.createdAt)}
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
    id: 'actions',
    header: '',
    cell: ({ row }) => (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onViewDetails(row.original._id)}
        className="h-9 text-sm"
      >
        View details
      </Button>
    ),
    enableSorting: false,
  },
];

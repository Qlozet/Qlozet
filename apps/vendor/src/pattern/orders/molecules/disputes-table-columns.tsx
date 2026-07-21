'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Dispute } from '@/redux/services/disputes/disputes.api-slice';
import { formatDate } from '../lib/order-fields';
import {
  canRespond,
  disputeStatusBadge,
  readDisputeCustomer,
  readDisputeReason,
  readDisputeRef,
  readDisputeStatus,
} from '../lib/dispute-fields';

export interface DisputesColumnActions {
  onRespond: (d: Dispute) => void;
}

export const createDisputesColumns = (
  actions: DisputesColumnActions
): ColumnDef<Dispute>[] => [
  {
    id: 'date',
    header: 'Date',
    cell: ({ row }) => (
      <span className='whitespace-nowrap text-sm text-gray-600 dark:text-muted-foreground'>
        {formatDate(row.original.createdAt)}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: 'order',
    header: 'Order',
    cell: ({ row }) => (
      <span className='whitespace-nowrap text-sm font-medium text-grey-black dark:text-foreground'>
        {readDisputeRef(row.original)}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: 'customer',
    header: 'Customer',
    cell: ({ row }) => (
      <span className='whitespace-nowrap text-sm text-gray-600 dark:text-muted-foreground'>
        {readDisputeCustomer(row.original)}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: 'reason',
    header: 'Reason',
    cell: ({ row }) => (
      <span className='block max-w-[240px] truncate text-sm text-gray-600 dark:text-muted-foreground'>
        {readDisputeReason(row.original)}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const badge = disputeStatusBadge(readDisputeStatus(row.original));
      return (
        <span
          className={cn(
            'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
            badge.className
          )}
        >
          {badge.label}
        </span>
      );
    },
    enableSorting: false,
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const d = row.original;
      if (!canRespond(d)) {
        return <span className='text-sm text-gray-400'>—</span>;
      }
      const label = d.vendor_response ? 'Update response' : 'Respond';
      return (
        <Button
          size='sm'
          className='h-8'
          onClick={() => actions.onRespond(d)}
        >
          {label}
        </Button>
      );
    },
    enableSorting: false,
  },
];
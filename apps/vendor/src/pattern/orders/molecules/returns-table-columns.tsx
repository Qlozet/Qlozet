'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ReturnRequest } from '@/redux/services/returns/returns.api-slice';
import { formatDate, formatNaira } from '../lib/order-fields';
import {
  readReturnCustomer,
  readReturnReason,
  readReturnRef,
  readReturnStatus,
  returnStatusBadge,
} from '../lib/return-fields';

export interface ReturnsColumnActions {
  onApprove: (r: ReturnRequest) => void;
  onReject: (r: ReturnRequest) => void;
  onReceived: (r: ReturnRequest) => void;
  /** _id of the row whose mutation is in flight (disables its buttons). */
  busyId?: string | null;
}

export const createReturnsColumns = (
  actions: ReturnsColumnActions
): ColumnDef<ReturnRequest>[] => [
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
        {readReturnRef(row.original)}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: 'customer',
    header: 'Customer',
    cell: ({ row }) => (
      <span className='whitespace-nowrap text-sm text-gray-600 dark:text-muted-foreground'>
        {readReturnCustomer(row.original)}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: 'reason',
    header: 'Reason',
    cell: ({ row }) => (
      <span className='block max-w-[220px] truncate text-sm text-gray-600 dark:text-muted-foreground'>
        {readReturnReason(row.original)}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: 'refund',
    header: 'Refund',
    cell: ({ row }) => (
      <span className='whitespace-nowrap text-sm text-gray-600 dark:text-muted-foreground'>
        {typeof row.original.refund_amount === 'number'
          ? formatNaira(row.original.refund_amount)
          : '—'}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const badge = returnStatusBadge(readReturnStatus(row.original));
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
      const r = row.original;
      const status = readReturnStatus(r);
      const busy = actions.busyId === r._id;

      // pending -> approve / reject ; approved -> mark received ; else nothing.
      if (status === 'pending') {
        return (
          <div className='flex items-center gap-2'>
            <Button
              size='sm'
              className='h-8 bg-[#0F973D] text-white hover:bg-[#0F973D]/90'
              disabled={busy}
              onClick={() => actions.onApprove(r)}
            >
              {busy ? <Loader2 className='size-3.5 animate-spin' /> : 'Approve'}
            </Button>
            <Button
              size='sm'
              variant='outline'
              className='h-8 text-[#D42620] border-[#D42620]/40 hover:bg-[#FBEAE9]'
              disabled={busy}
              onClick={() => actions.onReject(r)}
            >
              Reject
            </Button>
          </div>
        );
      }

      if (status === 'approved') {
        return (
          <Button
            size='sm'
            variant='outline'
            className='h-8'
            disabled={busy}
            onClick={() => actions.onReceived(r)}
          >
            {busy ? (
              <Loader2 className='size-3.5 animate-spin' />
            ) : (
              'Mark received'
            )}
          </Button>
        );
      }

      return <span className='text-sm text-gray-400'>—</span>;
    },
    enableSorting: false,
  },
];
'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  formatDate,
  formatNaira,
  readAmount,
  readNarration,
  readStatus,
  readTransactionDate,
  readTransactionId,
  readTransactionType,
  transactionBadge,
  type TransactionRow,
} from '../lib/transaction-fields';

export const createTransactionColumns = (
  onViewDetails: (transaction: TransactionRow) => void
): ColumnDef<TransactionRow>[] => [
  {
    id: 'date',
    header: 'Date',
    cell: ({ row }) => (
      <span className='whitespace-nowrap text-sm text-gray-600'>
        {formatDate(readTransactionDate(row.original))}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: 'transaction_id',
    header: 'Transaction ID',
    cell: ({ row }) => (
      <span className='whitespace-nowrap text-sm text-gray-600 font-normal'>
        {readTransactionId(row.original)}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: 'transaction_type',
    header: 'Transaction type',
    cell: ({ row }) => (
      <span className='whitespace-nowrap text-sm text-gray-600'>
        {readTransactionType(row.original)}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: 'narration',
    header: 'Narration',
    cell: ({ row }) => (
      <span className='block max-w-[200px] truncate text-sm text-gray-600'>
        {readNarration(row.original)}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: 'amount',
    header: 'Amount',
    cell: ({ row }) => (
      <span className='whitespace-nowrap text-sm text-gray-600'>
        {formatNaira(readAmount(row.original))}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const badge = transactionBadge(readStatus(row.original));
      return (
        <span
          className={cn(
            'inline-flex h-6.5 items-center justify-center whitespace-nowrap rounded-lg px-3 text-xs font-medium',
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
    header: '',
    cell: ({ row }) => (
      <Button
        type='button'
        variant='outline'
        size='sm'
        onClick={() => onViewDetails(row.original)}
        className='text-xs'
      >
        View Details
      </Button>
    ),
    enableSorting: false,
  },
];

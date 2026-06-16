'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Transaction } from '@/redux/services/transactions/transactions.api-slice';
import { formatDate } from '@/lib/customers';

const STATUS_BADGE_VARIANT: Record<string, 'success' | 'warning' | 'error'> = {
  successful: 'success',
  success: 'success',
  completed: 'success',
  pending: 'warning',
  processing: 'warning',
  failed: 'error',
  declined: 'error',
};

const getTransactionStatus = (
  transaction: Transaction
): { label: string; variant: 'success' | 'warning' | 'error' } => {
  const raw = (transaction.status ?? '').toString().toLowerCase();
  const variant = STATUS_BADGE_VARIANT[raw] ?? 'warning';
  const label = raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : 'Pending';
  return { label, variant };
};

const getTransactionId = (transaction: Transaction): string =>
  transaction.transactionId || transaction.reference || transaction._id;

const getNarration = (transaction: Transaction): string =>
  transaction.narration || transaction.description || 'Nil';

const formatAmount = (transaction: Transaction): string => {
  const { amount, currency } = transaction;
  if (typeof amount !== 'number' || Number.isNaN(amount)) return '—';
  return `${currency || 'NGN'} ${amount.toLocaleString()}`;
};

interface CustomerTransactionsColumnsProps {
  onViewDetails: (transaction: Transaction) => void;
}

export const createCustomerTransactionsColumns = ({
  onViewDetails,
}: CustomerTransactionsColumnsProps): ColumnDef<Transaction>[] => [
  {
    id: 'date',
    header: 'Date',
    cell: ({ row }) => (
      <div className="text-sm text-gray-600">
        {formatDate(row.original.createdAt)}
      </div>
    ),
    enableSorting: false,
  },
  {
    id: 'transactionId',
    header: 'Transaction ID',
    cell: ({ row }) => (
      <div className="text-sm text-gray-600">
        {getTransactionId(row.original)}
      </div>
    ),
    enableSorting: false,
  },
  {
    id: 'type',
    header: 'Transaction type',
    cell: ({ row }) => (
      <div className="text-sm text-gray-600 capitalize">
        {row.original.type || '—'}
      </div>
    ),
    enableSorting: false,
  },
  {
    id: 'narration',
    header: 'Narration',
    cell: ({ row }) => (
      <div className="max-w-[180px] truncate text-sm text-gray-600">
        {getNarration(row.original)}
      </div>
    ),
    enableSorting: false,
  },
  {
    id: 'amount',
    header: 'Amount',
    cell: ({ row }) => (
      <div className="text-sm text-gray-600">{formatAmount(row.original)}</div>
    ),
    enableSorting: false,
  },
  {
    id: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = getTransactionStatus(row.original);
      return (
        <Badge
          variant={status.variant}
          shape="square"
          className="flex h-[26px] w-fit items-center justify-center px-3 text-xs font-normal"
        >
          {status.label}
        </Badge>
      );
    },
    enableSorting: false,
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => (
      <Button
        type="button"
        variant="outline"
        onClick={() => onViewDetails(row.original)}
        className="h-9 rounded-lg text-sm font-normal text-gray-700"
      >
        View Details
      </Button>
    ),
    enableSorting: false,
  },
];

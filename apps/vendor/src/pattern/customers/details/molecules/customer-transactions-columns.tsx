'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { formatDate } from '@/lib/customers';
import type { CustomerOrderPreview } from '@/redux/services/customers/customers.api-slice';

const STATUS_BADGE_VARIANT: Record<string, 'success' | 'warning' | 'error'> = {
  successful: 'success',
  success: 'success',
  completed: 'success',
  delivered: 'success',
  paid: 'success',
  pending: 'warning',
  processing: 'warning',
  confirmed: 'warning',
  shipped: 'warning',
  failed: 'error',
  declined: 'error',
  cancelled: 'error',
  return: 'error',
};

const getStatus = (
  status?: string
): { label: string; variant: 'success' | 'warning' | 'error' } => {
  const raw = (status ?? '').toString().toLowerCase();
  const variant = STATUS_BADGE_VARIANT[raw] ?? 'warning';
  const label = raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : 'Pending';
  return { label, variant };
};

interface CustomerTransactionsColumnsProps {
  onViewDetails: (order: CustomerOrderPreview) => void;
}

// The customer's orders rendered as wallet-style transaction rows (the closest
// real "transactions" signal a vendor has for a customer).
export const createCustomerTransactionsColumns = ({
  onViewDetails,
}: CustomerTransactionsColumnsProps): ColumnDef<CustomerOrderPreview>[] => [
  {
    id: 'date',
    header: 'Date',
    cell: ({ row }) => (
      <div className='text-sm text-gray-600'>
        {formatDate(row.original.createdAt)}
      </div>
    ),
    enableSorting: false,
  },
  {
    id: 'transactionId',
    header: 'Transaction ID',
    cell: ({ row }) => (
      <div className='text-sm text-gray-600'>{row.original.reference}</div>
    ),
    enableSorting: false,
  },
  {
    id: 'type',
    header: 'Transaction type',
    cell: () => <div className='text-sm text-gray-600'>Order</div>,
    enableSorting: false,
  },
  {
    // The slim order preview carries no narration; shown as a dash.
    id: 'narration',
    header: 'Narration',
    cell: () => (
      <div className='max-w-[180px] truncate text-sm text-gray-600'>—</div>
    ),
    enableSorting: false,
  },
  {
    id: 'amount',
    header: 'Amount',
    cell: ({ row }) => (
      <div className='text-sm text-gray-600'>
        {typeof row.original.total === 'number'
          ? formatCurrency(row.original.total, 'NGN')
          : '—'}
      </div>
    ),
    enableSorting: false,
  },
  {
    id: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = getStatus(row.original.status);
      return (
        <Badge
          variant={status.variant}
          shape='square'
          className='flex h-[26px] w-fit items-center justify-center px-3 text-xs font-normal'
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
        type='button'
        variant='outline'
        onClick={() => onViewDetails(row.original)}
        className='h-9 rounded-lg text-sm font-normal text-gray-700'
      >
        View Details
      </Button>
    ),
    enableSorting: false,
  },
];

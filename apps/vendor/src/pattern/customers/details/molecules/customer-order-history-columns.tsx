'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/customers';
import type { CustomerOrderPreview } from '@/redux/services/customers/customers.api-slice';

// The order preview only carries reference/total/status/createdAt — so Product
// name and Product price are honest dashes (not in the payload); Amount paid
// maps to the order total. See [[no-stubbed-data]].

const formatNaira = (value?: number): string =>
  typeof value === 'number' && !Number.isNaN(value)
    ? `NGN ${value.toLocaleString()}`
    : '—';

// Order status → the design's three delivery states.
const deliveryBadge = (
  status?: CustomerOrderPreview['status']
): { label: string; variant: 'success' | 'warning' | 'error' } => {
  switch (status) {
    case 'delivered':
      return { label: 'Successful', variant: 'success' };
    case 'cancelled':
    case 'refunded':
      return { label: 'Failed', variant: 'error' };
    default:
      return { label: 'Pending', variant: 'warning' };
  }
};

export const createOrderHistoryColumns = (
  onViewOrder: (order: CustomerOrderPreview) => void
): ColumnDef<CustomerOrderPreview>[] => [
  {
    id: 'date',
    header: 'Date',
    cell: ({ row }) => (
      <span className='whitespace-nowrap text-sm text-gray-600 dark:text-gray-400'>
        {formatDate(row.original.createdAt)}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: 'product_name',
    header: 'Product name',
    cell: () => <span className='text-sm text-gray-600 dark:text-gray-400'>—</span>,
    enableSorting: false,
  },
  {
    id: 'product_price',
    header: 'Product price',
    cell: () => <span className='text-sm text-gray-600 dark:text-gray-400'>—</span>,
    enableSorting: false,
  },
  {
    id: 'amount_paid',
    header: 'Amount paid',
    cell: ({ row }) => (
      <span className='whitespace-nowrap text-sm text-gray-600 dark:text-gray-400'>
        {formatNaira(row.original.total)}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: 'delivery_status',
    header: 'Delivery Status',
    cell: ({ row }) => {
      const badge = deliveryBadge(row.original.status);
      return (
        <Badge
          variant={badge.variant}
          shape='square'
          className='flex h-[26px] w-fit items-center justify-center px-3 text-xs font-normal'
        >
          {badge.label}
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
        size='sm'
        onClick={() => onViewOrder(row.original)}
        className='h-9 text-sm'
      >
        View order
      </Button>
    ),
    enableSorting: false,
  },
];

'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  deliveryBadge,
  formatDate,
  formatNaira,
  readAmountPaid,
  readCustomerName,
  readItemsCount,
  readOrderId,
  readProductPrice,
  readStatus,
  type OrderRow,
} from '../lib/order-fields';

export const createOrdersColumns = (
  onViewDetails: (order: OrderRow) => void
): ColumnDef<OrderRow>[] => [
  {
    id: 'date',
    header: 'Date',
    cell: ({ row }) => (
      <span className='whitespace-nowrap text-sm text-gray-600 dark:text-muted-foreground'>
        {formatDate(row.original.createdAt ?? row.original.date)}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: 'order_id',
    header: 'Order ID',
    cell: ({ row }) => (
      <span className='whitespace-nowrap text-sm font-medium text-grey-black dark:text-foreground'>
        {readOrderId(row.original)}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: 'product_price',
    header: 'Product price',
    cell: ({ row }) => (
      <span className='whitespace-nowrap text-sm text-gray-600 dark:text-muted-foreground'>
        {formatNaira(readProductPrice(row.original))}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: 'customer',
    header: 'Customer name',
    cell: ({ row }) => (
      <span className='whitespace-nowrap text-sm text-gray-600 dark:text-muted-foreground'>
        {readCustomerName(row.original)}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: 'amount_paid',
    header: 'Amount paid',
    cell: ({ row }) => (
      <span className='whitespace-nowrap text-sm text-gray-600 dark:text-muted-foreground'>
        {formatNaira(readAmountPaid(row.original))}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: 'items',
    header: 'Items',
    cell: ({ row }) => {
      const count = readItemsCount(row.original);
      return (
        <span className='whitespace-nowrap text-sm text-gray-600 dark:text-muted-foreground'>
          {count} item{count === 1 ? '' : 's'}
        </span>
      );
    },
    enableSorting: false,
  },
  {
    id: 'delivery_status',
    header: 'Delivery Status',
    cell: ({ row }) => {
      const badge = deliveryBadge(readStatus(row.original));
      return (
        <span
          className={cn(
            'inline-flex h-[26px] items-center justify-center whitespace-nowrap rounded-[8px] px-3 text-xs font-medium',
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
        className='h-9 text-sm dark:border-border dark:text-foreground dark:hover:bg-muted'
      >
        View details
      </Button>
    ),
    enableSorting: false,
  },
];

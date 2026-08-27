'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { AdminOrder } from '@/redux/services/orders/orders.api-slice';
import {
  formatItemsCount,
  formatNaira,
  formatOrderDate,
  orderStatusBadge,
  readAmountPaid,
  readCustomerName,
  readItemsCount,
  readOrderId,
  readProductPrice,
  readStatus,
} from '@/lib/orders';

interface OrdersTableColumnsProps {
  onViewDetails: (order: AdminOrder) => void;
}

export const createOrdersTableColumns = ({
  onViewDetails,
}: OrdersTableColumnsProps): ColumnDef<AdminOrder>[] => [
  {
    id: 'date',
    header: 'Date',
    cell: ({ row }) => (
      <span className="text-sm text-gray-600 dark:text-gray-400">
        {formatOrderDate(row.original.createdAt)}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: 'orderId',
    header: 'Order ID',
    cell: ({ row }) => (
      <span className="text-sm text-gray-600 dark:text-gray-400">
        {readOrderId(row.original)}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: 'productPrice',
    header: 'Product price',
    cell: ({ row }) => (
      <span className="text-sm text-gray-600 dark:text-gray-400">
        {formatNaira(readProductPrice(row.original))}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: 'customerName',
    header: 'Customer name',
    cell: ({ row }) => (
      <span className="text-sm font-medium text-gray-900 dark:text-white">
        {readCustomerName(row.original)}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: 'amountPaid',
    header: 'Amount paid',
    cell: ({ row }) => (
      <span className="text-sm text-gray-600 dark:text-gray-400">
        {formatNaira(readAmountPaid(row.original))}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: 'items',
    header: 'Items',
    cell: ({ row }) => (
      <span className="text-sm text-gray-600 dark:text-gray-400">
        {formatItemsCount(readItemsCount(row.original))}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: 'status',
    header: 'Delivery Status',
    cell: ({ row }) => {
      const badge = orderStatusBadge(readStatus(row.original));
      return (
        <span
          className={cn(
            'inline-flex h-[26px] w-fit items-center justify-center whitespace-nowrap rounded-md px-3 text-xs font-normal',
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
        type="button"
        variant="outline"
        onClick={() => onViewDetails(row.original)}
        className="h-9 rounded-lg text-sm font-normal text-gray-700 dark:text-gray-200"
      >
        View details
      </Button>
    ),
    enableSorting: false,
  },
];

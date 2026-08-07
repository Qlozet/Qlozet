'use client';

import Image from 'next/image';
import { Package } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Order } from '@/redux/services/orders/orders.api-slice';
import {
  deliveryBadge,
  formatDate,
  formatNaira,
  readAmountPaid,
  readCustomerName,
  readItemsCount,
  readOrderId,
  readOrderImage,
  readOrderTitle,
  readProductPrice,
  readStatus,
} from '../lib/order-fields';

export const createOrdersColumns = (
  onViewDetails: (order: Order) => void
): ColumnDef<Order>[] => [
  {
    id: 'product',
    header: 'Product',
    cell: ({ row }) => {
      const img = readOrderImage(row.original);
      const title = readOrderTitle(row.original);
      const count = readItemsCount(row.original);
      return (
        <div className="flex items-center gap-2.5">
          <div className="relative shrink-0">
            <div className="relative size-9 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
              {img ? (
                <Image
                  src={img}
                  alt={title}
                  fill
                  className="object-cover"
                  sizes="36px"
                />
              ) : (
                <div className="flex size-full items-center justify-center text-gray-400">
                  <Package className="size-4" />
                </div>
              )}
            </div>
            {count > 1 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold leading-none text-primary-foreground ring-2 ring-white dark:ring-card">
                {count}
              </span>
            )}
          </div>
          <span className="max-w-[160px] truncate text-sm font-medium text-grey-black dark:text-foreground">
            {title}
          </span>
        </div>
      );
    },
    enableSorting: false,
  },
  {
    id: 'date',
    header: 'Date',
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm text-gray-600 dark:text-muted-foreground">
        {formatDate(row.original.createdAt)}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: 'order_id',
    header: 'Order ID',
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm font-medium text-grey-black dark:text-foreground">
        {readOrderId(row.original)}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: 'product_price',
    header: 'Product price',
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm text-gray-600 dark:text-muted-foreground">
        {formatNaira(readProductPrice(row.original))}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: 'customer',
    header: 'Customer name',
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm text-gray-600 dark:text-muted-foreground">
        {readCustomerName(row.original)}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: 'amount_paid',
    header: 'Amount paid',
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm text-gray-600 dark:text-muted-foreground">
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
        <span className="whitespace-nowrap text-sm text-gray-600 dark:text-muted-foreground">
          {count} item{count === 1 ? '' : 's'}
        </span>
      );
    },
    enableSorting: false,
  },
  {
    id: 'delivery_status',
    header: 'Status',
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
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onViewDetails(row.original)}
        className="text-xs"
      >
        View Details
      </Button>
    ),
    enableSorting: false,
  },
];

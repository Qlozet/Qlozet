'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import type { VendorTopProduct } from '@/redux/services/vendor-details/vendor-details.api-slice';

const statusVariant = (status?: string): 'success' | 'warning' | 'error' => {
  const s = (status ?? '').toLowerCase();
  if (['approved', 'active'].includes(s)) return 'success';
  if (['not approved', 'rejected', 'inactive', 'deleted'].includes(s))
    return 'error';
  return 'warning';
};

const statusLabel = (status?: string): string => {
  if (!status) return 'Pending approval';
  return status.charAt(0).toUpperCase() + status.slice(1);
};

// Ranked by real sales (server aggregates order items) — so the columns are
// sales facts, not the demo-era stock/variant guesses.
export const createTopProductsColumns = (): ColumnDef<VendorTopProduct>[] => [
  {
    id: 'rank',
    header: '#',
    cell: ({ row }) => (
      <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
        {row.index + 1}
      </span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'name',
    header: 'Product',
    cell: ({ row }) => {
      const p = row.original;
      return (
        <div className="flex items-center gap-3">
          <div className="h-[31px] w-[51px] shrink-0 overflow-hidden rounded-[8px] border border-border bg-gray-50 dark:bg-muted">
            {p.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.image}
                alt={p.name ?? 'product'}
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm text-gray-700 dark:text-gray-200">
              {p.name ?? '—'}
            </span>
            {p.kind && (
              <span className="text-[11px] capitalize text-gray-400">
                {p.kind}
              </span>
            )}
          </div>
        </div>
      );
    },
    enableSorting: false,
  },
  {
    id: 'price',
    header: 'Price',
    cell: ({ row }) => {
      const p = row.original;
      const price =
        p.discounted_price && p.discounted_price > 0
          ? p.discounted_price
          : p.base_price;
      return (
        <span className="text-sm text-gray-700 dark:text-gray-200">
          {typeof price === 'number' ? formatCurrency(price, 'NGN') : '—'}
        </span>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: 'units_sold',
    header: 'Units sold',
    cell: ({ row }) => (
      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
        {row.original.units_sold.toLocaleString()}
      </span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'orders',
    header: 'Orders',
    cell: ({ row }) => (
      <span className="text-sm text-gray-700 dark:text-gray-200">
        {row.original.orders.toLocaleString()}
      </span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'revenue',
    header: 'Revenue',
    cell: ({ row }) => (
      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
        {formatCurrency(row.original.revenue ?? 0, 'NGN')}
      </span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'status',
    header: 'Product Status',
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
];

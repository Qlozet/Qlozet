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

interface TopProductsColumnsOptions {
  /** The best seller's revenue; every bar is drawn relative to it. */
  maxRevenue: number;
  /** Revenue across the whole ranked list, for the share column. */
  totalRevenue: number;
}

// Ranked by real sales (server aggregates order items) — so the columns are
// sales facts, not the demo-era stock/variant guesses. Rows open the product.
export const createTopProductsColumns = ({
  maxRevenue,
  totalRevenue,
}: TopProductsColumnsOptions): ColumnDef<VendorTopProduct>[] => [
  {
    id: 'rank',
    header: '#',
    cell: ({ row }) => (
      <span className="text-sm font-semibold tabular-nums text-gray-500 dark:text-gray-400">
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
          {/* Portrait, like the catalogue cards: product photos are 3:4. */}
          <div className="h-10 w-[30px] shrink-0 overflow-hidden rounded-md border border-border bg-gray-50 dark:bg-muted">
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
            <span
              className="max-w-[220px] truncate text-sm font-medium text-gray-800 dark:text-gray-100"
              title={p.name ?? undefined}
            >
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
        <span className="text-sm tabular-nums text-gray-700 dark:text-gray-200">
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
      <span className="text-sm font-medium tabular-nums text-gray-700 dark:text-gray-200">
        {row.original.units_sold.toLocaleString()}
      </span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'orders',
    header: 'Orders',
    cell: ({ row }) => (
      <span className="text-sm tabular-nums text-gray-700 dark:text-gray-200">
        {row.original.orders.toLocaleString()}
      </span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'revenue',
    header: 'Revenue',
    cell: ({ row }) => {
      const revenue = row.original.revenue ?? 0;
      const width =
        maxRevenue > 0 ? Math.max(4, (revenue / maxRevenue) * 100) : 0;
      const share =
        totalRevenue > 0 ? Math.round((revenue / totalRevenue) * 100) : 0;
      return (
        <div className="min-w-[140px]">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm font-medium tabular-nums text-gray-700 dark:text-gray-200">
              {formatCurrency(revenue, 'NGN')}
            </span>
            <span className="text-[11px] tabular-nums text-gray-400">
              {share}%
            </span>
          </div>
          {/* Share of the ranked list's revenue, so the drop-off after the
              top seller is visible without reading the numbers. */}
          <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-muted">
            <div
              className="h-full rounded-full bg-primary/70"
              style={{ width: `${width}%` }}
            />
          </div>
        </div>
      );
    },
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

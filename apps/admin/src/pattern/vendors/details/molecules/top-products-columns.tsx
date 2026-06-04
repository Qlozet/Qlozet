'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatCurrency } from '@/lib/utils';
import type { VendorProduct } from '@/redux/services/vendor-details/vendor-details.api-slice';

const statusVariant = (
  status?: string
): 'success' | 'warning' | 'error' => {
  const s = (status ?? '').toLowerCase();
  if (['approved', 'active'].includes(s)) return 'success';
  if (['not approved', 'rejected', 'inactive'].includes(s)) return 'error';
  return 'warning';
};

const statusLabel = (status?: string): string => {
  if (!status) return 'Pending approval';
  return status.charAt(0).toUpperCase() + status.slice(1);
};

export const createTopProductsColumns = (): ColumnDef<VendorProduct>[] => [
  {
    id: 'picture',
    header: 'Picture',
    cell: ({ row }) => {
      const img = row.original.images?.[0];
      return (
        <div className="h-[31px] w-[51px] overflow-hidden rounded-[8px] border border-border bg-gray-50">
          {img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={img}
              alt={row.original.name ?? 'product'}
              className="h-full w-full object-cover"
            />
          ) : null}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: 'name',
    header: 'Product name',
    cell: ({ row }) => (
      <span className="text-sm text-gray-700">
        {row.original.name ?? '—'}
      </span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'price',
    header: 'Product price',
    cell: ({ row }) => (
      <span className="text-sm text-gray-700">
        {typeof row.original.price === 'number'
          ? formatCurrency(row.original.price, 'NGN')
          : '—'}
      </span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'category',
    header: 'Category',
    cell: ({ row }) => (
      <span className="text-sm capitalize text-gray-700">
        {row.original.category ?? '—'}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: 'tag',
    header: 'Tag',
    cell: ({ row }) => (
      <span className="text-sm capitalize text-gray-700">
        {row.original.tag ?? row.original.tags?.[0] ?? '—'}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: 'quantity',
    header: 'Quantity',
    cell: ({ row }) => {
      const stock = row.original.stock ?? 0;
      const variantCount = row.original.variants?.length ?? 1;
      const stockVariant =
        stock <= 0 ? 'error' : stock <= 5 ? 'warning' : 'success';
      return (
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Badge
            variant={stockVariant}
            shape="square"
            className="flex h-4 min-w-[19px] items-center justify-center rounded-[4px] p-0 text-xs"
          >
            {stock}
          </Badge>
          <span>in</span>
          <Badge
            variant="outline"
            shape="square"
            className="flex h-4 min-w-[19px] items-center justify-center rounded-[4px] bg-accent p-0 text-xs"
          >
            {variantCount}
          </Badge>
          <span>Variants</span>
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
  {
    id: 'actions',
    header: '',
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem>View product</DropdownMenuItem>
          <DropdownMenuItem>Edit product</DropdownMenuItem>
          <DropdownMenuItem className="text-destructive">
            Deactivate
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    enableSorting: false,
  },
];

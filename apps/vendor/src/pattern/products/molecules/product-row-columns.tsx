'use client';

// Columns shared by the Clothing, Fabrics and Accessories tables: the tick
// box column shown while selecting, and the ⋯ menu on every row.

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Product } from '@/redux/services/products/products.api-slice';

const stop = (e: React.MouseEvent) => e.stopPropagation();

/** First column while selecting. The header ticks every row on this page. */
export function productSelectColumn(): ColumnDef<Product> {
  return {
    id: 'select',
    header: ({ table }) => (
      <div onClick={stop}>
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select every product on this page"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div onClick={stop}>
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select product"
        />
      </div>
    ),
    enableSorting: false,
  };
}

interface ProductActionsOptions {
  onViewDetails: (productId: string) => void;
  onEdit: (productId: string) => void;
  /** Starts selecting, with this product already ticked. */
  onSelect?: (productId: string) => void;
  onDelete?: (productId: string) => void;
  onStatusChange?: (
    productId: string,
    status: 'active' | 'draft' | 'inactive' | 'scheduled'
  ) => void;
}

/**
 * The ⋯ menu. Only offers what would change something: Activate when the
 * product is not on sale, Archive when it is not archived already. (Archive
 * and Deactivate used to be two items doing the same thing.)
 */
export function productActionsColumn({
  onViewDetails,
  onEdit,
  onSelect,
  onDelete,
  onStatusChange,
}: ProductActionsOptions): ColumnDef<Product> {
  return {
    id: 'actions',
    header: () => null,
    cell: ({ row }) => {
      const product = row.original;
      const id = product._id as string;
      const status = String((product as { status?: string }).status ?? '');

      return (
        <div onClick={stop}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                aria-label="Product actions"
              >
                <MoreHorizontal className="h-4 w-4 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewDetails(id)}>
                View product
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(id)}>
                Edit product
              </DropdownMenuItem>
              {onSelect && !row.getIsSelected() && (
                <DropdownMenuItem onClick={() => onSelect(id)}>
                  Select
                </DropdownMenuItem>
              )}
              {onStatusChange && status !== 'active' && (
                <DropdownMenuItem onClick={() => onStatusChange(id, 'active')}>
                  Activate product
                </DropdownMenuItem>
              )}
              {onStatusChange && status !== 'archived' && (
                <DropdownMenuItem
                  onClick={() => onStatusChange(id, 'inactive')}
                >
                  Archive product
                </DropdownMenuItem>
              )}
              {onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(id)}
                    className="text-red-600 focus:text-red-600"
                  >
                    Delete product
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
    enableSorting: false,
  };
}

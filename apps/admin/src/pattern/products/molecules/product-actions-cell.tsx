'use client';

import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Product } from '@/redux/services/products/products.api-slice';

export type ProductAction =
  | 'view'
  | 'edit'
  | 'activate'
  | 'schedule'
  | 'approve'
  | 'deactivate'
  | 'reject'
  | 'delete';

interface ProductActionsCellProps {
  product: Product;
  onAction?: (action: ProductAction, product: Product) => void;
}

// Shared row-actions dropdown for every product catalogue table (Clothing,
// Fabric, Accessories) so the action list stays in one place.
export const ProductActionsCell = ({
  product,
  onAction,
}: ProductActionsCellProps) => {
  const act = (action: ProductAction) => () => onAction?.(action, product);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={act('view')}>View product</DropdownMenuItem>
        <DropdownMenuItem onClick={act('edit')}>Edit product</DropdownMenuItem>
        <DropdownMenuItem onClick={act('activate')}>
          Activate product
        </DropdownMenuItem>
        <DropdownMenuItem onClick={act('schedule')}>
          Schedule activation
        </DropdownMenuItem>
        <DropdownMenuItem onClick={act('approve')}>
          Approve product
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={act('deactivate')}
        >
          Deactivate product
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={act('reject')}
        >
          Reject Product
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={act('delete')}
        >
          Delete product
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

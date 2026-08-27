'use client';

import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getProductModeration, getProductStatus } from '@/lib/products';
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

/**
 * Shared row-actions dropdown for every product catalogue table (Clothing,
 * Fabric, Accessories) so the action list stays in one place.
 *
 * Items that would be a no-op for the row are disabled rather than hidden — the
 * menu keeps a stable shape, and a greyed "Activate product" on a live listing
 * reads as state, whereas a missing item reads as a bug.
 */
export const ProductActionsCell = ({
  product,
  onAction,
}: ProductActionsCellProps) => {
  const act = (action: ProductAction) => (event: React.MouseEvent) => {
    // The row itself opens the product; the menu must not do both.
    event.stopPropagation();
    onAction?.(action, product);
  };

  const status = getProductStatus(product).key;
  const moderation = getProductModeration(product);

  const isLive = status === 'active';
  const isRejected = moderation === 'rejected';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 w-8 p-0"
          onClick={(event) => event.stopPropagation()}
        >
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={act('view')}>View product</DropdownMenuItem>
        <DropdownMenuItem onClick={act('edit')}>Edit product</DropdownMenuItem>
        <DropdownMenuItem
          disabled={isLive || isRejected}
          onClick={act('activate')}
        >
          Activate product
        </DropdownMenuItem>
        <DropdownMenuItem disabled={isRejected} onClick={act('schedule')}>
          Schedule activation
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={moderation === 'approved'}
          onClick={act('approve')}
        >
          Approve product
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          disabled={!isLive}
          className="text-destructive focus:text-destructive"
          onClick={act('deactivate')}
        >
          Deactivate product
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={isRejected}
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

'use client';

import { Badge, type BadgeProps } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getProductStatus, type ProductStatusKey } from '@/lib/products';
import type { Product } from '@/redux/services/products/products.api-slice';

// Badge variant (and any extra classes) for each product status. Active/Inactive/
// Draft/Scheduled/Rejected map onto existing Badge variants; Archived is a
// neutral grey pill that the variants don't cover.
const STATUS_STYLES: Record<
  ProductStatusKey,
  { variant: BadgeProps['variant']; className?: string }
> = {
  active: { variant: 'success' },
  inactive: { variant: 'error' },
  draft: { variant: 'warning' },
  scheduled: { variant: 'blue' },
  rejected: { variant: 'error' },
  archived: {
    variant: 'secondary',
    className:
      'bg-gray-200 text-gray-600 hover:bg-gray-200 dark:bg-muted dark:text-gray-400 dark:hover:bg-muted',
  },
};

interface ProductStatusBadgeProps {
  product: Product;
}

export const ProductStatusBadge = ({ product }: ProductStatusBadgeProps) => {
  const status = getProductStatus(product);
  const style = STATUS_STYLES[status.key];

  return (
    <Badge
      variant={style.variant}
      shape="square"
      className={cn(
        'flex h-[26px] w-fit items-center justify-center px-3 text-xs font-normal',
        style.className
      )}
    >
      {status.label}
    </Badge>
  );
};

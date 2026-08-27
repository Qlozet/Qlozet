'use client';

import { useEffect, useState } from 'react';
import { ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getProductImage, getProductName } from '@/lib/products';
import type { Product } from '@/redux/services/products/products.api-slice';

interface ProductThumbnailProps {
  product: Product;
  className?: string;
}

/**
 * The row thumbnail, with a fallback for an image that fails to load.
 *
 * Vendors paste hosted URLs, and a dead one used to render the browser's own
 * broken-image glyph — a jagged icon and the alt text spilling out of a 51px
 * cell. A missing image and a broken one now look the same, and deliberate.
 */
export const ProductThumbnail = ({
  product,
  className,
}: ProductThumbnailProps) => {
  const src = getProductImage(product);
  const [failed, setFailed] = useState(false);

  // A row can be recycled onto a different product as the table paginates.
  useEffect(() => setFailed(false), [src]);

  return (
    <div
      className={cn(
        'flex h-[31px] w-[51px] items-center justify-center overflow-hidden rounded-[8px] border border-border bg-gray-50 dark:bg-muted',
        className
      )}
    >
      {src && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={getProductName(product)}
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <ImageOff className="size-3.5 text-gray-300 dark:text-gray-600" />
      )}
    </div>
  );
};

'use client';

// Shared thumbnail / selection-row / section atoms for order sub-documents.
// Extracted from the item detail modal so the bespoke drawer's Fabric and
// Accessories & add-ons sections render identically without a second copy.

import React from 'react';
import Image from 'next/image';
import { Package } from 'lucide-react';
import { formatNaira } from '../lib/order-fields';

export const Thumb: React.FC<{
  url?: string | null;
  swatch?: string | null;
  fallbackIcon?: React.ReactNode;
  alt: string;
}> = ({ url, swatch, fallbackIcon, alt }) => (
  <div
    className='relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#E5E7EB] dark:border-border bg-gray-100 dark:bg-gray-700'
    style={swatch ? { backgroundColor: swatch } : undefined}
  >
    {url ? (
      <Image src={url} alt={alt} fill className='object-cover' sizes='44px' />
    ) : swatch ? null : (
      fallbackIcon ?? <Package className='size-4 text-gray-400' />
    )}
  </div>
);

export const SelectionRow: React.FC<{
  url?: string | null;
  swatch?: string | null;
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  price?: number;
  qty?: number;
  /** Right-hand pill, e.g. "Included". */
  badge?: React.ReactNode;
  /**
   * Render the price under the title instead of in the right-hand column.
   * The bespoke drawer's Accessories list uses this; the item detail modal
   * keeps the default right-aligned price.
   */
  priceBelow?: boolean;
}> = ({
  url,
  swatch,
  icon,
  title,
  subtitle,
  price,
  qty,
  badge,
  priceBelow = false,
}) => {
  const hasPrice = typeof price === 'number' && price > 0;
  return (
    <div className='flex items-center gap-3 px-3 py-2.5'>
      <Thumb url={url} swatch={swatch} fallbackIcon={icon} alt={title} />
      <div className='min-w-0 flex-1'>
        <p className='truncate text-sm font-medium text-[#333333] dark:text-white'>
          {title}
        </p>
        {subtitle && (
          <p className='truncate text-xs text-grey3 dark:text-gray-400'>
            {subtitle}
          </p>
        )}
        {priceBelow && hasPrice && (
          <p className='text-sm font-semibold text-[#333333] dark:text-white'>
            {formatNaira(price)}
          </p>
        )}
      </div>
      <div className='shrink-0 text-right'>
        {badge}
        {!priceBelow && hasPrice && (
          <p className='text-sm font-semibold text-[#333333] dark:text-white'>
            {formatNaira(price)}
          </p>
        )}
        {typeof qty === 'number' && qty > 0 && (
          <p className='text-[11px] text-grey3 dark:text-gray-400'>×{qty}</p>
        )}
      </div>
    </div>
  );
};

export const Section: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, icon, children }) => (
  <div className='space-y-2'>
    <div className='flex items-center gap-1.5'>
      {icon}
      <h4 className='text-xs font-semibold uppercase tracking-wider text-grey3 dark:text-gray-400'>
        {title}
      </h4>
    </div>
    <div className='divide-y divide-[#F1F3F5] dark:divide-border rounded-xl border border-[#E5E7EB] dark:border-border bg-[hsla(0,0%,96%,1)] dark:bg-[#4A4949]'>
      {children}
    </div>
  </div>
);

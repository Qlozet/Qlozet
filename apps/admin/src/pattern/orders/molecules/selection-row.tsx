'use client';

// Shared thumbnail / selection-row / section atoms for order sub-documents.
// Ported from the vendor app so an order item reads identically in both
// consoles; the admin build drops the dark-mode variants it doesn't use.

import React from 'react';
import { Package } from 'lucide-react';
import { formatNaira } from '@/lib/orders';

export const Thumb = ({
  url,
  swatch,
  fallbackIcon,
  alt,
}: {
  url?: string | null;
  swatch?: string | null;
  fallbackIcon?: React.ReactNode;
  alt: string;
}) => (
  <div
    className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#E5E7EB] bg-gray-100"
    style={swatch ? { backgroundColor: swatch } : undefined}
  >
    {url ? (
      // Plain <img>: product media is on arbitrary vendor-supplied hosts and
      // next/image would reject any host missing from remotePatterns.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={alt}
        className="size-full object-cover"
        loading="lazy"
      />
    ) : swatch ? null : (
      (fallbackIcon ?? <Package className="size-4 text-gray-400" />)
    )}
  </div>
);

export const SelectionRow = ({
  url,
  swatch,
  icon,
  title,
  subtitle,
  price,
  qty,
}: {
  url?: string | null;
  swatch?: string | null;
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  price?: number;
  qty?: number;
}) => {
  const hasPrice = typeof price === 'number' && price > 0;
  return (
    <div className="flex items-center gap-3 px-3 py-2.5">
      <Thumb url={url} swatch={swatch} fallbackIcon={icon} alt={title} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[#333333]">{title}</p>
        {subtitle && <p className="truncate text-xs text-grey3">{subtitle}</p>}
      </div>
      <div className="shrink-0 text-right">
        {hasPrice && (
          <p className="text-sm font-semibold text-[#333333]">
            {formatNaira(price)}
          </p>
        )}
        {typeof qty === 'number' && qty > 0 && (
          <p className="text-[11px] text-grey3">×{qty}</p>
        )}
      </div>
    </div>
  );
};

export const Section = ({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="space-y-2">
    <div className="flex items-center gap-1.5">
      {icon}
      <h4 className="text-xs font-semibold uppercase tracking-wider text-grey3">
        {title}
      </h4>
    </div>
    <div className="divide-y divide-[#F1F3F5] rounded-xl border border-[#E5E7EB] bg-[hsla(0,0%,96%,1)]">
      {children}
    </div>
  </div>
);

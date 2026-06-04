'use client';

import { cn } from '@/lib/utils';

interface VendorInfoCardProps {
  label: string;
  value?: string;
  /** Optional inline link (e.g. "View all", "View document"). */
  linkLabel?: string;
  onLinkClick?: () => void;
  /** When set, applies emphasis colour to the value (e.g. green "Verified"). */
  valueClassName?: string;
}

// Single labelled cell from the vendor info grid.
export const VendorInfoCard = ({
  label,
  value,
  linkLabel,
  onLinkClick,
  valueClassName,
}: VendorInfoCardProps) => {
  return (
    <div className="flex flex-col gap-2 rounded-xl bg-white p-4 custom-card-shadow">
      <p className="text-xs text-gray-500">{label}</p>
      <div className="flex items-center justify-between gap-2">
        <p
          className={cn(
            'text-sm font-semibold text-[hsla(210,9%,31%,1)] truncate',
            valueClassName
          )}
        >
          {value || '—'}
        </p>
        {linkLabel ? (
          <button
            type="button"
            onClick={onLinkClick}
            className="shrink-0 text-xs font-medium text-primary underline underline-offset-2 hover:opacity-80 cursor-pointer"
          >
            {linkLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
};

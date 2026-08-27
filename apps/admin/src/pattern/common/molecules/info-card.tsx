'use client';

import { Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface InfoCardProps {
  label: string;
  value?: string;
  /** Optional inline text link (e.g. "View all", "View document"). */
  linkLabel?: string;
  onLinkClick?: () => void;
  /** When set, renders the value as an anchor (e.g. a mailto: email link). */
  href?: string;
  /** When set, renders a pencil affordance to the right that calls this. */
  onEdit?: () => void;
  /** When set, applies emphasis colour to the value (e.g. green "Verified"). */
  valueClassName?: string;
  className?: string;
}

// Single labelled info cell used across the vendor and customer detail grids.
// A card shows a muted label, a value, and one optional right-side affordance:
// a text link, a pencil edit button, or the value itself as a link.
//
// The text link needs both a label and a handler. Rendering it on the label
// alone produces a button that looks actionable and does nothing — which is how
// "Not uploaded · View document" ended up on the vendor detail page.
export const InfoCard = ({
  label,
  value,
  linkLabel,
  onLinkClick,
  href,
  onEdit,
  valueClassName,
  className,
}: InfoCardProps) => {
  return (
    <div
      className={cn(
        'flex flex-col gap-2 rounded-xl bg-white dark:bg-card p-4 custom-card-shadow',
        className
      )}
    >
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <div className="flex items-center justify-between gap-2">
        {href ? (
          <a
            href={href}
            className={cn(
              'truncate text-sm font-semibold text-primary underline underline-offset-2 hover:opacity-80',
              valueClassName
            )}
          >
            {value || '—'}
          </a>
        ) : (
          <p
            className={cn(
              'truncate text-sm font-semibold text-[hsla(210,9%,31%,1)] dark:text-white',
              valueClassName
            )}
          >
            {value || '—'}
          </p>
        )}

        {linkLabel && onLinkClick ? (
          <button
            type="button"
            onClick={onLinkClick}
            className="shrink-0 text-xs font-medium text-primary underline underline-offset-2 hover:opacity-80 cursor-pointer"
          >
            {linkLabel}
          </button>
        ) : onEdit ? (
          <button
            type="button"
            aria-label={`Edit ${label}`}
            onClick={onEdit}
            className="shrink-0 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer"
          >
            <Pencil className="size-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
};

// Placeholder for a card whose value is still in flight. A grid of dashes is
// indistinguishable from a customer who genuinely has nothing set, so the two
// states must not look alike.
export const InfoCardSkeleton = ({ className }: { className?: string }) => (
  <div
    className={cn(
      'flex animate-pulse flex-col gap-3 rounded-xl bg-white dark:bg-card p-4 custom-card-shadow',
      className
    )}
  >
    <div className="h-3 w-20 rounded bg-gray-200 dark:bg-gray-700" />
    <div className="h-5 w-28 rounded bg-gray-300 dark:bg-gray-600" />
  </div>
);

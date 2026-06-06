'use client';

import { Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductAlertBannerProps {
  message: string;
  onDismiss?: () => void;
  className?: string;
}

// Dismissible guideline banner shown above the Add Product form (e.g. image
// quality tips). Mirrors the vendor banner so the two apps read the same.
export const ProductAlertBanner = ({
  message,
  onDismiss,
  className,
}: ProductAlertBannerProps) => {
  return (
    <div
      className={cn(
        'flex w-full items-start justify-between gap-3 rounded-lg bg-[hsla(27,97%,12%,0.08)] p-4',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-primary text-primary-foreground">
          <Info className="size-4" />
        </span>
        <p className="text-sm text-grey-black dark:text-white">{message}</p>
      </div>
      {onDismiss && (
        <button
          type="button"
          aria-label="Dismiss"
          onClick={onDismiss}
          className="text-grey-black transition-opacity hover:opacity-70 dark:text-white"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
};

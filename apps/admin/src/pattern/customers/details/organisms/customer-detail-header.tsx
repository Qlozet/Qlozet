'use client';

import { ChevronRight, ClipboardList, Flag, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Customer } from '@/redux/services/customers/customers.api-slice';
import {
  getCustomerName,
  getCustomerHandle,
  getCustomerAvatar,
  getCustomerInitial,
  getCustomerStatus,
} from '@/lib/customers';

interface CustomerDetailHeaderProps {
  customer?: Customer;
  isLoading?: boolean;
  onEscalate?: () => void;
  onEdit?: () => void;
  onViewReviews?: () => void;
}

export const CustomerDetailHeader = ({
  customer,
  isLoading,
  onEscalate,
  onEdit,
  onViewReviews,
}: CustomerDetailHeaderProps) => {
  const c = customer ?? ({} as Customer);
  const avatar = getCustomerAvatar(c);
  const status = getCustomerStatus(c);
  const reviews =
    typeof c.reviewsCount === 'number' ? c.reviewsCount : undefined;

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      {/* Identity */}
      <div className="flex items-center gap-4">
        <div
          className={cn(
            'flex size-20 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-2xl font-bold text-primary',
            isLoading && 'animate-pulse'
          )}
        >
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatar}
              alt={getCustomerName(c)}
              className="h-full w-full object-cover"
            />
          ) : (
            getCustomerInitial(c)
          )}
        </div>

        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-[hsla(210,9%,31%,1)]">
            {getCustomerName(c)}
          </h1>
          <p className="text-sm text-gray-500">{getCustomerHandle(c) || '—'}</p>
          <p
            className={cn(
              'text-sm font-medium',
              status.variant === 'active'
                ? 'text-[#0F973D]'
                : 'text-destructive'
            )}
          >
            {status.label}
          </p>
          <button
            type="button"
            onClick={onViewReviews}
            className="mt-1 inline-flex w-fit items-center gap-1 rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
          >
            {typeof reviews === 'number' ? reviews : 20} reviews
            <ChevronRight className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Notes"
          className="flex size-10 items-center justify-center rounded-lg border border-border text-gray-600 hover:bg-gray-50 cursor-pointer"
        >
          <ClipboardList className="size-5" />
        </button>
        <button
          type="button"
          aria-label="Flag customer"
          className="flex size-10 items-center justify-center rounded-lg border border-border text-destructive hover:bg-gray-50 cursor-pointer"
        >
          <Flag className="size-5" />
        </button>
        <Button
          type="button"
          variant="outline"
          onClick={onEscalate}
          className="h-10 border-destructive/40 text-destructive hover:bg-destructive/5"
        >
          Escalate to support
        </Button>
        <Button type="button" onClick={onEdit} className="h-10 gap-2">
          Edit Information
          <Pencil className="size-4" />
        </Button>
      </div>
    </div>
  );
};

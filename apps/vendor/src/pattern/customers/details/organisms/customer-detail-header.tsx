'use client';

import Image from 'next/image';
import { ChevronRight, ClipboardList, Flag, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { VendorCustomer } from '@/redux/services/customers/customers.api-slice';
import {
  getCustomerName,
  getCustomerInitial,
  getCustomerStatus,
} from '@/lib/customers';

interface CustomerDetailHeaderProps {
  customer?: VendorCustomer;
  isLoading?: boolean;
  onEscalate?: () => void;
  onEdit?: () => void;
  onViewReviews?: () => void;
  /** Opens the customer's measurements view (clipboard icon). */
  onViewMeasurements?: () => void;
}

export const CustomerDetailHeader = ({
  customer,
  isLoading,
  onEscalate,
  onEdit,
  onViewReviews,
  onViewMeasurements,
}: CustomerDetailHeaderProps) => {
  const name = customer ? getCustomerName(customer) : '—';
  const avatar = customer?.profile_picture;
  const status = customer
    ? getCustomerStatus(customer)
    : { variant: 'inactive' as const, label: '—' };

  return (
    <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
      {/* Identity */}
      <div className='flex items-center gap-4'>
        <div
          className={cn(
            'flex size-20 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-2xl font-bold text-primary',
            isLoading && 'animate-pulse'
          )}
        >
          {avatar ? (
            <Image
              src={avatar}
              alt={name}
              width={80}
              height={80}
              className='h-full w-full object-cover'
            />
          ) : customer ? (
            getCustomerInitial(customer)
          ) : null}
        </div>

        <div className='flex flex-col gap-1'>
          <h1 className='text-xl font-bold text-[hsla(210,9%,31%,1)]'>{name}</h1>
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
          {/* "Reviews" pill: no reviews data source for a vendor's customer yet,
              so it links out instead of asserting a fabricated count. */}
          <button
            type='button'
            onClick={onViewReviews}
            className='mt-1 inline-flex w-fit items-center gap-1 rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer'
          >
            Reviews
            <ChevronRight className='size-3.5' />
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className='flex items-center gap-3'>
        <button
          type='button'
          aria-label='View measurements'
          onClick={onViewMeasurements}
          className='flex size-10 items-center justify-center rounded-lg border border-border text-gray-600 hover:bg-gray-50 cursor-pointer'
        >
          <ClipboardList className='size-5' />
        </button>
        <button
          type='button'
          aria-label='Flag customer'
          className='flex size-10 items-center justify-center rounded-lg border border-border text-destructive hover:bg-gray-50 cursor-pointer'
        >
          <Flag className='size-5' />
        </button>
        <Button
          type='button'
          variant='outline'
          onClick={onEscalate}
          className='h-10 border-destructive/40 text-destructive hover:bg-destructive/5'
        >
          Escalate to support
        </Button>
        <Button type='button' onClick={onEdit} className='h-10 gap-2'>
          Edit Information
          <Pencil className='size-4' />
        </Button>
      </div>
    </div>
  );
};

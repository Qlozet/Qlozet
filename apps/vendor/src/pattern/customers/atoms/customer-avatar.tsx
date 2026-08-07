'use client';

// Customer Avatar — Atom
// The one avatar used by every customer surface (table row, mobile card,
// details header). Shows the profile picture when there is one, and falls
// back to the initial when there isn't — or when the URL fails to load.

import React, { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { getCustomerInitial, getCustomerName } from '@/lib/customers';
import type { VendorCustomer } from '@/redux/services/customers/customers.api-slice';

const SIZES = {
  sm: { box: 'size-9', text: 'text-xs', px: '36px' },
  md: { box: 'size-10', text: 'text-sm', px: '40px' },
  lg: { box: 'size-16', text: 'text-lg', px: '64px' },
} as const;

interface CustomerAvatarProps {
  customer: VendorCustomer;
  size?: keyof typeof SIZES;
  className?: string;
}

export const CustomerAvatar: React.FC<CustomerAvatarProps> = ({
  customer,
  size = 'sm',
  className,
}) => {
  const [failed, setFailed] = useState(false);
  const { box, text, px } = SIZES[size];

  const src = customer?.profile_picture?.trim();
  const showImage = Boolean(src) && !failed;

  return (
    <div
      className={cn(
        'relative shrink-0 overflow-hidden rounded-full',
        showImage ? 'bg-gray-100 dark:bg-muted' : 'bg-primary/10',
        box,
        className
      )}
    >
      {showImage ? (
        <Image
          src={src as string}
          alt={getCustomerName(customer)}
          fill
          sizes={px}
          className="object-cover"
          // Customer pictures live on whichever host the backend stored them
          // on. The image optimizer rejects any host missing from
          // next.config's remotePatterns — and silently renders nothing — so
          // serve these directly. They're avatar-sized; the loss is nil.
          unoptimized
          onError={() => setFailed(true)}
        />
      ) : (
        <span
          className={cn(
            'flex size-full items-center justify-center font-semibold text-primary',
            text
          )}
        >
          {getCustomerInitial(customer)}
        </span>
      )}
    </div>
  );
};

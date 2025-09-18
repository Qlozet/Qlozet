// Payment Status Badge - Atom
// Status indicator badge for payment status with color coding

import React from 'react';
import { cn } from '@/lib/utils';

interface PaymentStatusBadgeProps {
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  className?: string;
}

export const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({
  status,
  className,
}) => {
  const statusConfig = {
    pending: {
      text: 'Pending',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
    },
    paid: {
      text: 'Paid',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
    },
    failed: {
      text: 'Failed',
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
    },
    refunded: {
      text: 'Refunded',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800',
    },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        config.bgColor,
        config.textColor,
        className
      )}
    >
      {config.text}
    </span>
  );
};

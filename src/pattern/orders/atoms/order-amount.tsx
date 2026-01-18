// Order Amount - Atom
// Displays formatted currency amount

import React from 'react';
import { cn } from '@/lib/utils';

interface OrderAmountProps {
  amount: number;
  currency?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const OrderAmount: React.FC<OrderAmountProps> = ({
  amount,
  currency = 'USD',
  size = 'md',
  className,
}) => {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg font-semibold',
  };

  const formatCurrency = (amount: number, currency: string): string => {
    if (currency === 'NGN' || currency === '₦') {
      return `₦${amount.toLocaleString()}`;
    }

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  return (
    <span
      className={cn('font-medium text-gray-900', sizeClasses[size], className)}
    >
      {formatCurrency(amount, currency)}
    </span>
  );
};

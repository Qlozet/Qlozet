// Order Status Badge - Atom
// Status indicator badge for order status with color coding

import React from 'react';
import { cn } from '@/lib/utils';

interface OrderStatusBadgeProps {
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'return';
  className?: string;
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ 
  status, 
  className 
}) => {
  const statusConfig = {
    pending: {
      text: 'Pending',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
    },
    confirmed: {
      text: 'Confirmed',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800',
    },
    processing: {
      text: 'Processing',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-800',
    },
    shipped: {
      text: 'Shipped',
      bgColor: 'bg-indigo-100',
      textColor: 'text-indigo-800',
    },
    delivered: {
      text: 'Delivered',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
    },
    cancelled: {
      text: 'Cancelled',
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
    },
    return: {
      text: 'Return',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-800',
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
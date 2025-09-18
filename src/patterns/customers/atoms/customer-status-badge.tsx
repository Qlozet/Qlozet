// Customer Status Badge - Atom
// Simple status indicator badge for customer status

import React from 'react';
import { cn } from '@/lib/utils';

interface CustomerStatusBadgeProps {
  status: 'active' | 'inactive';
  className?: string;
}

export const CustomerStatusBadge: React.FC<CustomerStatusBadgeProps> = ({
  status,
  className,
}) => {
  const statusConfig = {
    active: {
      text: 'Active',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
    },
    inactive: {
      text: 'Inactive',
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
    },
  };

  const config = statusConfig[status] || statusConfig.inactive;

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

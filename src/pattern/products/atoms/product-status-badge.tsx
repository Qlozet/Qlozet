// Product Status Badge - Atom
// Status indicator badge for product status

import React from 'react';
import { cn } from '@/lib/utils';

interface ProductStatusBadgeProps {
  status: 'draft' | 'active' | 'inactive' | 'out_of_stock';
  className?: string;
}

export const ProductStatusBadge: React.FC<ProductStatusBadgeProps> = ({
  status,
  className,
}) => {
  const statusConfig = {
    draft: {
      text: 'Draft',
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-800',
    },
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
    out_of_stock: {
      text: 'Out of Stock',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-800',
    },
  };

  const config = statusConfig[status] || statusConfig.draft;

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

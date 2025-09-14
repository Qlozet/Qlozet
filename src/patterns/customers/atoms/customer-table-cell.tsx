// Customer Table Cell - Atom
// Reusable table cell component for customer data

import React from 'react';
import { cn } from '@/lib/utils';

interface CustomerTableCellProps {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export const CustomerTableCell: React.FC<CustomerTableCellProps> = ({ 
  children, 
  align = 'left',
  className 
}) => {
  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <td 
      className={cn(
        'px-6 py-4 whitespace-nowrap text-sm text-gray-900',
        alignmentClasses[align],
        className
      )}
    >
      {children}
    </td>
  );
};
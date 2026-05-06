// Customer Stat Card - Atom
// Simple card for displaying customer statistics

import React from 'react';
import { cn } from '@/lib/utils';

interface CustomerStatCardProps {
  title: string;
  value: string | number;
  bgColor?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const CustomerStatCard: React.FC<CustomerStatCardProps> = ({
  title,
  value,
  bgColor = 'bg-blue-500',
  icon,
  className,
}) => {
  return (
    <div
      className={cn(
        'relative p-6 rounded-lg text-white shadow-sm',
        bgColor,
        className
      )}
    >
      {icon && <div className='absolute top-4 right-4 opacity-80'>{icon}</div>}

      <div className='space-y-2'>
        <p className='text-sm font-medium opacity-90'>{title}</p>
        <p className='text-2xl font-bold'>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
      </div>
    </div>
  );
};

// Stock Indicator - Atom
// Displays stock status with color coding

import React from 'react';
import { cn } from '@/lib/utils';

interface StockIndicatorProps {
  stock: number;
  lowStockThreshold?: number;
  className?: string;
  showText?: boolean;
}

export const StockIndicator: React.FC<StockIndicatorProps> = ({ 
  stock, 
  lowStockThreshold = 10,
  className,
  showText = true
}) => {
  const getStockStatus = (stock: number) => {
    if (stock === 0) {
      return {
        status: 'out_of_stock',
        text: 'Out of Stock',
        color: 'text-red-600',
        bgColor: 'bg-red-100',
      };
    } else if (stock <= lowStockThreshold) {
      return {
        status: 'low_stock',
        text: 'Low Stock',
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
      };
    } else {
      return {
        status: 'in_stock',
        text: 'In Stock',
        color: 'text-green-600',
        bgColor: 'bg-green-100',
      };
    }
  };

  const stockStatus = getStockStatus(stock);

  if (showText) {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <span 
          className={cn(
            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
            stockStatus.bgColor,
            stockStatus.color
          )}
        >
          {stockStatus.text}
        </span>
        <span className="text-sm text-gray-600">
          ({stock} {stock === 1 ? 'item' : 'items'})
        </span>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <div 
        className={cn(
          'w-2 h-2 rounded-full',
          stockStatus.status === 'out_of_stock' && 'bg-red-500',
          stockStatus.status === 'low_stock' && 'bg-orange-500',
          stockStatus.status === 'in_stock' && 'bg-green-500'
        )}
      />
      <span className="text-sm text-gray-600">
        {stock} in stock
      </span>
    </div>
  );
};
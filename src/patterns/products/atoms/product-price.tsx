// Product Price - Atom
// Displays formatted product price with currency

import React from 'react';
import { cn } from '@/lib/utils';

interface ProductPriceProps {
  price: number;
  originalPrice?: number;
  currency?: string;
  size?: 'sm' | 'md' | 'lg';
  showCurrency?: boolean;
  className?: string;
}

export const ProductPrice: React.FC<ProductPriceProps> = ({ 
  price, 
  originalPrice,
  currency = 'USD',
  size = 'md',
  showCurrency = true,
  className 
}) => {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg font-semibold',
  };

  const formatPrice = (amount: number, currency: string): string => {
    if (currency === 'NGN' || currency === '₦') {
      return `₦${amount.toLocaleString()}`;
    }
    
    if (!showCurrency) {
      return amount.toLocaleString();
    }
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const hasDiscount = originalPrice && originalPrice > price;

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <span 
        className={cn(
          'font-medium text-gray-900',
          sizeClasses[size],
          hasDiscount && 'text-red-600'
        )}
      >
        {formatPrice(price, currency)}
      </span>
      
      {hasDiscount && (
        <span 
          className={cn(
            'line-through text-gray-500',
            size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'
          )}
        >
          {formatPrice(originalPrice, currency)}
        </span>
      )}
    </div>
  );
};
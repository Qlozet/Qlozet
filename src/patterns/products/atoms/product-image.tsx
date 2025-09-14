// Product Image - Atom
// Product image display with fallback and multiple sizes

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Package } from 'lucide-react';

interface ProductImageProps {
  src?: string;
  alt: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fallback?: React.ReactNode;
}

export const ProductImage: React.FC<ProductImageProps> = ({ 
  src, 
  alt, 
  size = 'md',
  className,
  fallback
}) => {
  const sizeClasses = {
    xs: 'h-8 w-8',
    sm: 'h-12 w-12',
    md: 'h-16 w-16',
    lg: 'h-24 w-24',
    xl: 'h-32 w-32',
  };

  const defaultFallback = (
    <div 
      className={cn(
        'bg-gray-100 rounded-lg flex items-center justify-center',
        sizeClasses[size]
      )}
    >
      <Package className="h-1/2 w-1/2 text-gray-400" />
    </div>
  );

  if (!src) {
    return fallback || defaultFallback;
  }

  return (
    <div 
      className={cn(
        'relative overflow-hidden rounded-lg',
        sizeClasses[size],
        className
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes={size === 'xs' ? '32px' : size === 'sm' ? '48px' : size === 'md' ? '64px' : size === 'lg' ? '96px' : '128px'}
        onError={() => {
          // Could implement fallback logic here
        }}
      />
    </div>
  );
};
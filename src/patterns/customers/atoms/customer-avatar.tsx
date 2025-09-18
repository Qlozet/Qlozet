// Customer Avatar - Atom
// Displays customer profile image with fallback to initials

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface CustomerAvatarProps {
  src?: string;
  alt: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const CustomerAvatar: React.FC<CustomerAvatarProps> = ({
  src,
  alt,
  name,
  size = 'md',
  className,
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg',
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center overflow-hidden rounded-full bg-gray-100',
        sizeClasses[size],
        className
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          className='object-cover'
          sizes={
            size === 'sm'
              ? '32px'
              : size === 'md'
                ? '40px'
                : size === 'lg'
                  ? '48px'
                  : '64px'
          }
        />
      ) : (
        <span className='font-medium text-gray-600'>{getInitials(name)}</span>
      )}
    </div>
  );
};

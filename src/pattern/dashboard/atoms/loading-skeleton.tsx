// Loading Skeleton - Atom
// Skeleton loading states for dashboard components

import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  variant?: 'card' | 'chart' | 'list' | 'table';
  className?: string;
  count?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  variant = 'card',
  className,
  count = 1,
}) => {
  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return (
          <div className='animate-pulse bg-gray-200 rounded-lg p-6 min-w-[280px]'>
            <div className='space-y-3'>
              <div className='h-4 bg-gray-300 rounded w-1/2'></div>
              <div className='h-8 bg-gray-300 rounded w-3/4'></div>
              <div className='h-3 bg-gray-300 rounded w-1/3'></div>
            </div>
          </div>
        );
      case 'chart':
        return (
          <div className='animate-pulse bg-white rounded-lg p-6'>
            <div className='space-y-4'>
              <div className='h-6 bg-gray-200 rounded w-1/3'></div>
              <div className='h-64 bg-gray-100 rounded'></div>
            </div>
          </div>
        );
      case 'list':
        return (
          <div className='animate-pulse bg-white rounded-lg p-4'>
            <div className='space-y-3'>
              {[...Array(5)].map((_, i) => (
                <div key={i} className='flex items-center space-x-3'>
                  <div className='w-10 h-10 bg-gray-200 rounded-full'></div>
                  <div className='flex-1 space-y-2'>
                    <div className='h-4 bg-gray-200 rounded w-3/4'></div>
                    <div className='h-3 bg-gray-200 rounded w-1/2'></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'table':
        return (
          <div className='animate-pulse bg-white rounded-lg overflow-hidden'>
            <div className='h-12 bg-gray-100 border-b'></div>
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className='h-16 bg-gray-50 border-b border-gray-100'
              ></div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {[...Array(count)].map((_, index) => (
        <React.Fragment key={index}>{renderSkeleton()}</React.Fragment>
      ))}
    </div>
  );
};

// Loading State - Atom
// Displays a centered loading indicator with message

import React from 'react';
import Typography from '@/components/Typography';
import Loader from '@/components/Loader';

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  size = 'lg',
  className = '',
}) => {
  return (
    <div
      className={`flex items-center justify-center min-h-[400px] ${className}`}
    >
      <div className='text-center'>
        <Loader size={size} />
        <Typography className='mt-4 text-gray-600'>{message}</Typography>
      </div>
    </div>
  );
};

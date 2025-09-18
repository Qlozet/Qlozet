// Chart Container - Atom
// Container wrapper for charts with consistent styling

import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ChartContainerProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
  isLoading?: boolean;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  children,
  className,
  headerAction,
  isLoading = false,
}) => {
  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className='pb-4'>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-lg font-semibold text-gray-900'>
            {title}
          </CardTitle>
          {headerAction}
        </div>
      </CardHeader>
      <CardContent className='pt-0'>
        {isLoading ? (
          <div className='h-64 flex items-center justify-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
          </div>
        ) : (
          <div className='h-64 flex items-center justify-center'>
            {children}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

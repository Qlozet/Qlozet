// Form Section Header - Atom
// Header component for form sections

import React from 'react';
import { cn } from '@/lib/utils';

interface FormSectionHeaderProps {
  title: string;
  className?: string;
}

export const FormSectionHeader: React.FC<FormSectionHeaderProps> = ({
  title,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex items-center justify-between border-dashed border-b-[1.5px] border-gray-200 pb-4 mb-6',
        className
      )}
    >
      <h2 className='text-sm font-bold text-primary'>{title}</h2>
    </div>
  );
};

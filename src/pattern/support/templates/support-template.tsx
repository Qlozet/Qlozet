// Support Template - Template
// Complete support page template

import React from 'react';
import { cn } from '@/lib/utils';
import { SupportForm } from '../molecules/support-form';
import { type SupportData } from '@/lib/validations/support';

interface SupportTemplateProps {
  onSubmit: (data: SupportData) => void;
  isLoading?: boolean;
  className?: string;
}

export const SupportTemplate: React.FC<SupportTemplateProps> = ({
  onSubmit,
  isLoading = false,
  className,
}) => {
  return (
    <section className={cn('', className)}>
      <div className='flex bg-[#F8F9FA]'>
        <div className='w-full p-4'>
          <div className='min-h-[80vh]'>
            <div className='mt-4 mx-auto'>
              <SupportForm onSubmit={onSubmit} isLoading={isLoading} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SupportTemplate;

// Page Header - Molecule
// Displays page title, subtitle, back button, and header actions

import React from 'react';
import GoBack from '@/components/GoBack';
import Typography from '@/components/compat/Typography';
import { Separator } from '@/components/ui/separator';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  backUrl?: string;
  headerActions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  showBackButton = true,
  backUrl = '/',
  headerActions,
  className = '',
}) => {
  return (
    <div className={`mb-8 ${className}`}>
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center gap-4'>
          {showBackButton && <GoBack href={backUrl} />}
          <div>
            <Typography
              variant='h1'
              className='text-3xl font-bold text-gray-900'
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography variant='body1' className='text-gray-600 mt-1'>
                {subtitle}
              </Typography>
            )}
          </div>
        </div>
        {headerActions && (
          <div className='flex items-center gap-3'>{headerActions}</div>
        )}
      </div>
      <Separator />
    </div>
  );
};

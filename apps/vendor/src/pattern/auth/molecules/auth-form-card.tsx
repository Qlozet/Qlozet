'use client';

import React from 'react';
import Logo from '@/components/Logo';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import CardGeometricPattern from '@/public/assets/image/white-card-geometric-pattern.jpg';

export interface AuthFormCardProps {
  title: string;
  subtitle?: string;
  className?: string;
  showLogo?: boolean;
  children: React.ReactNode;
}

export const AuthFormCard: React.FC<AuthFormCardProps> = ({
  title,
  subtitle,
  className = '',
  showLogo = true,
  children,
}) => {
  return (
    <main className='bg-inherit w-full min-h-screen flex flex-col items-center justify-center p-4'>
      {/* Logo */}
      {showLogo && (
        <div className='mb-12'>
          <div className='dark:hidden'>
            <Logo brown={true} />
          </div>
          <div className='hidden dark:block'>
            <Logo white={true} />
          </div>
        </div>
      )}

      {/* Form Card */}
      <div
        className={cn(
          'relative bg-white dark:bg-card w-fit max-w-lg h-fit rounded-lg shadow-sm dark:shadow-none dark:border dark:border-white/10 p-6 md:p-8 z-20',
          className
        )}
      >
        {/* Title */}
        <div className='space-y-3 mb-3'>
          <h2 className='text-xl md:text-2xl font-medium font-poppins text-[hsla(0,0%,7%,1)] dark:text-foreground'>
            {title}
          </h2>

          {/* Subtitle (optional) */}
          {subtitle && (
            <p className='text-sm text-[hsla(0,0%,7%,1)] dark:text-gray-400'>{subtitle}</p>
          )}
        </div>

        {/* Divider */}
        <div className='bg-accent dark:bg-white/10 h-[2px] mb-6'></div>

        {/* Form Content */}
        <div>{children}</div>

        <Image
          src={CardGeometricPattern}
          alt='geometric pattern'
          fill
          className='absolute object-fill opacity-15 dark:opacity-5 -z-10'
        />
      </div>
    </main>
  );
};

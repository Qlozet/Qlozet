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
          <Logo brown={true} />
        </div>
      )}

      {/* Form Card */}
      <div
        className={cn(
          'relative bg-white w-fit max-w-lg h-fit rounded-lg shadow-sm p-6 md:p-8 z-20',
          className
        )}
      >
        {/* Title */}
        <div className='space-y-3 mb-3'>
          <h2 className='text-xl md:text-2xl font-medium font-poppins text-[hsla(0,0%,7%,1)]'>
            {title}
          </h2>

          {/* Subtitle (optional) */}
          {subtitle && (
            <p className='text-sm text-[hsla(0,0%,7%,1)]'>{subtitle}</p>
          )}
        </div>

        {/* Divider */}
        <div className='bg-accent h-[2px] mb-6'></div>

        {/* Form Content */}
        <div>{children}</div>

        <Image
          src={CardGeometricPattern}
          alt='geometric pattern'
          fill
          className='absolute object-fill opacity-15 -z-10'
        />
      </div>
    </main>
  );
};

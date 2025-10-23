'use client';

import React from 'react';
import Image, { StaticImageData } from 'next/image';
import Logo from '@/components/Logo';
import { cn } from '@/lib/utils';
import CardGeometricPattern from '@/public/assets/image/white-card-geometric-pattern.jpg';

export interface AuthMessageCardProps {
  title: string;
  description: string;
  className?: string;
  showPattern?: boolean;
  showLogo?: boolean;
  children?: React.ReactNode;
}

export const AuthMessageCard: React.FC<AuthMessageCardProps> = ({
  title,
  description,
  className = '',
  showPattern = true,
  showLogo = true,
  children,
}) => {
  return (
    <main className='bg-inherit w-full min-h-screen flex flex-col items-center justify-center p-4'>
      {/* Logo */}
      {showLogo && (
        <div className='mb-12'>
          <Logo />
        </div>
      )}

      {/* Message Card */}
      <div
        className={cn(
          'relative bg-white w-fit max-w-2xl min-h-[220px] h-fit rounded-lg shadow-sm',
          className
        )}
      >
        <div className='h-full w-full z-10 relative'>
          {/* Heading */}
          <h2 className='text-xl md:text-2xl font-medium font-poppins text-[hsla(0,0%,7%,1)] text-center px-4 pt-4 pb-3 md:px-8 md:pt-8'>
            {title}
          </h2>

          {/* Divider */}
          <div className='bg-accent h-[2px]'></div>

          {/* Message */}
          <div className='text-center text-[hsla(0,0%,7%,1)] text-base leading-relaxed px-3 pb-3 md:px-8 md:pb-8 mt-7'>
            {description}
          </div>

          {/* Optional children content */}
          {children && <div className='px-4 pb-4 md:px-8 md:pb-8'>{children}</div>}
        </div>

        {/* Background Pattern */}
        {showPattern && (
          <Image
            src={CardGeometricPattern}
            alt='geometric pattern'
            fill
            className='absolute object-cover opacity-15'
          />
        )}
      </div>
    </main>
  );
};

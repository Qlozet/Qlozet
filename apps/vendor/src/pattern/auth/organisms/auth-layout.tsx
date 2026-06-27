'use client';

import React from 'react';
import Image from 'next/image';
import Logo from '@/components/Logo';
import signupImage from '@/public/assets/image/Auth-image.png';
import AuthMobileOverlayImg from '@/public/assets/image/auth-mobile-overlay-img.png';
import { AuthAlertWidget, AuthAlertWidgetProps } from '../molecules/auth-alert-widget';
import { If } from '@/pattern/common/atoms/If';

interface AuthLayoutProps extends AuthAlertWidgetProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showImage?: boolean;
  className?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  showImage = true,
  isError,
  alertTitle,
  alertDescription,
  className = '',
}) => {
  return (
    <section
      className={`relative h-dvh w-full min-w-0 overflow-y-auto bg-[rgba(0,0,0,.7)] lg:bg-accent ${className}`}
    >
      {/* Mobile Background Overlay — fixed to the viewport so it stays in place while the content scrolls */}
      <div className='fixed inset-0 -z-10 lg:hidden'>
        <Image
          src={AuthMobileOverlayImg}
          alt='overlay image'
          fill
          priority
          className='object-cover opacity-60'
        />
        <div className='absolute inset-0 bg-[rgba(0,0,0,.7)]' />
      </div>

      {/* Centering wrapper: centers content when it fits, scrolls from the top when it doesn't */}
      <div className='flex min-h-full w-full flex-col items-center justify-start px-4 py-8 lg:flex-row lg:items-center lg:justify-center lg:gap-10 lg:px-[42px] lg:py-[75px]'>
        {/* Mobile Logo */}
        <div className='mb-6 lg:hidden'>
          <Logo />
        </div>

        {/* Form Container */}
        <div className='w-full max-w-[424px] rounded-[12px] bg-accent px-5 py-12 lg:bg-transparent lg:p-0'>
          {/* Desktop Logo */}
          <div className='mb-8 hidden lg:block'>
            <Logo brown={true} />
          </div>

          <If isTrue={isError ?? false}>
            <AuthAlertWidget isError={isError} alertTitle={alertTitle} alertDescription={alertDescription} />
          </If>

          {/* Title Section */}
          <div className='mb-8'>
            <h1 className='text-[2rem] font-medium font-poppins text-primary mb-2'>
              {title}
            </h1>
            {subtitle && (
              <p className='text-sm font-normal text-gray-600'>
                {subtitle}
              </p>
            )}
          </div>

          {/* Form Content */}
          {children}
        </div>

        {/* Image Container */}
        {showImage && (
          <div className='relative hidden h-[810px] w-full max-w-[878px] flex-1 lg:block'>
            <Image
              src={signupImage}
              alt='Authentication'
              fill
              className='object-cover'
            />
          </div>
        )}
      </div>
    </section>
  );
};

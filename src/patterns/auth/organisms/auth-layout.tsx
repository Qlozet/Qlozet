'use client';

import React from 'react';
import Image from 'next/image';
import Logo from '@/components/Logo';
import signupImage from '@/public/assets/image/Auth-image.png';
import { AuthAlertWidget, AuthAlertWidgetProps } from '../molecules/auth-alert-widget';
import { If } from '@/patterns/common/atoms/If';

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
    <section className={`h-screen overflow-hidden ${className}`}>
      <div className='lg:bg-accent block lg:flex items-center justify-center bg-cover bg-center relative'>
        {/* Mobile Background Overlay */}
        <div className='bg-[rgba(0,0,0,.7)] lg:bg-accent h-screen w-screen 2xl:flex justify-center items-center overflow-y-scroll'>
          {/* Mobile Logo */}
          <div className='block lg:hidden'>
            <div className='block mt-2 mb-4'>
              <Logo />
            </div>
          </div>

          <div className='flex lg:gap-10 max-w-7xl py-[75px] lg:px-[42px]'>
            {/* Form Container */}
            <div className='bg-accent w-fit max-w-[424px] p-4 lg:p-0 rounded-[12px] mx-4 mb-10'>
              {/* Desktop Logo */}
              <div className='hidden lg:block mb-8'>
                <Logo />
              </div>

              {/* <div className='flex h-full items-center translate-y-[-20%]'> */}
              <div className='mt-[6rem] md:mt-16 w-full'>

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
              {/* </div> */}
            </div>

            {/* Image Container */}
            {showImage && (
              <div className='hidden lg:relative w-full max-w-[878px] h-[810px] flex-1 lg:flex items-start justify-center'>
                <Image
                  src={signupImage}
                  alt='Authentication'
                  fill
                  className='object-cover'
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

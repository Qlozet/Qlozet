'use client';

import React from 'react';
import Image from 'next/image';
import Logo from '@/components/Logo';
import signupImage from '@/public/assets/svg/signupImage.svg';

interface AuthLayoutProps {
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
  className = '',
}) => {
  return (
    <section className={`h-screen overflow-hidden ${className}`}>
      <div className='lg:bg-[hsla(210,17%,98%,1)] block lg:flex items-center justify-center bg-cover bg-center relative'>
        {/* Mobile Background Overlay */}
        <div className='bg-[rgba(0,0,0,.7)] lg:bg-[hsla(210,17%,98%,1)] h-screen w-screen 2xl:flex justify-center items-center overflow-y-scroll'>
          {/* Mobile Logo */}
          <div className='block lg:hidden'>
            <div className='block mt-2 mb-4'>
              <Logo />
            </div>
          </div>

          <div className='flex lg:gap-10 max-w-7xl py-[75px] lg:px-[42px]'>
            {/* Form Container */}
            <div className='bg-[hsla(210,17%,98%,1)] w-fit max-w-[424px] p-4 lg:p-0 rounded-[12px] mx-4 mb-10'>
              {/* Desktop Logo */}
              <div className='hidden lg:block mb-8'>
                <Logo />
              </div>

              {/* <div className='flex h-full items-center translate-y-[-20%]'> */}
              <div className='mt-[6rem] md:mt-16 w-full'>
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
              <div className='hidden lg:relative w-full max-w-[878px] min-h-[1000px] h-screen flex-1 lg:flex items-start justify-center'>
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

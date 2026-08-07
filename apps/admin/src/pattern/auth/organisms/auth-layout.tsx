'use client';

import type { ReactNode } from 'react';
import Image from 'next/image';
import BrandLogo from '@/pattern/common/molecules/brand-logo';
import { cn } from '@/lib/utils';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  /** Hides the right-hand imagery (e.g. for narrow confirmation screens). */
  showImage?: boolean;
  isError?: boolean;
  alertTitle?: string;
  alertDescription?: ReactNode;
  className?: string;
}

/**
 * Split auth shell, ported from the vendor app so both consoles share one
 * sign-in experience: brand mark + form on the left, editorial imagery on the
 * right. Below `lg` the imagery becomes a dimmed full-bleed backdrop and the
 * form sits on a card.
 */
export const AuthLayout = ({
  children,
  title,
  subtitle,
  showImage = true,
  isError,
  alertTitle = 'Something went wrong',
  alertDescription,
  className,
}: AuthLayoutProps) => {
  return (
    <section
      className={cn(
        'relative h-dvh w-full min-w-0 overflow-y-auto bg-[rgba(0,0,0,.7)] lg:bg-accent',
        className
      )}
    >
      {/* Mobile backdrop — fixed to the viewport so it stays put while the
          form scrolls. */}
      <div className="fixed inset-0 -z-10 lg:hidden">
        <Image
          src="/assets/image/auth-mobile-overlay-img.png"
          alt=""
          aria-hidden
          fill
          priority
          className="object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-[rgba(0,0,0,.7)]" />
      </div>

      {/* Centres when the content fits, scrolls from the top when it doesn't. */}
      <div className="flex min-h-full w-full flex-col items-center justify-start px-4 py-8 lg:flex-row lg:items-center lg:justify-center lg:gap-10 lg:px-[42px] lg:py-[75px]">
        {/* Mobile logo */}
        <div className="mb-6 lg:hidden">
          <BrandLogo href={null} width="70" height="42" />
        </div>

        {/* Form column */}
        <div className="w-full max-w-[424px] rounded-[12px] bg-white px-5 py-12 lg:bg-transparent lg:p-0">
          {/* Desktop logo */}
          <div className="mb-8 hidden lg:block">
            <BrandLogo href={null} width="70" height="42" />
          </div>

          {isError && (
            <div
              role="alert"
              className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3"
            >
              <p className="text-sm font-medium text-red-800">{alertTitle}</p>
              {alertDescription && (
                <p className="mt-0.5 text-sm text-red-700">
                  {alertDescription}
                </p>
              )}
            </div>
          )}

          <div className="mb-8">
            <h1 className="mb-2 text-[2rem] font-medium text-primary">
              {title}
            </h1>
            {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
          </div>

          {children}
        </div>

        {/* Imagery column */}
        {showImage && (
          <div className="relative hidden h-[810px] w-full max-w-[878px] flex-1 lg:block">
            <Image
              src="/assets/image/Auth-image.png"
              alt=""
              aria-hidden
              fill
              priority
              className="object-cover"
            />
          </div>
        )}
      </div>
    </section>
  );
};

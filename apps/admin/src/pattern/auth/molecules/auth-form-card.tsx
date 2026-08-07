'use client';

import type { ReactNode } from 'react';
import Image from 'next/image';
import BrandLogo from '@/pattern/common/molecules/brand-logo';
import { cn } from '@/lib/utils';

interface AuthFormCardProps {
  title: string;
  subtitle?: string;
  showLogo?: boolean;
  className?: string;
  children: ReactNode;
}

/**
 * Centred card auth shell — the password-recovery screens use this rather than
 * the split `AuthLayout`, matching the shared designs (and the vendor app's
 * AuthFormCard).
 */
export const AuthFormCard = ({
  title,
  subtitle,
  showLogo = true,
  className,
  children,
}: AuthFormCardProps) => {
  return (
    <main className="flex min-h-dvh w-full flex-col items-center justify-center bg-accent p-4">
      {showLogo && (
        <div className="mb-12">
          {/* Not a link: the dashboard sits behind the auth guard. */}
          <BrandLogo href={null} width="80" height="48" />
        </div>
      )}

      <div
        className={cn(
          'relative z-20 h-fit w-full max-w-lg overflow-hidden rounded-lg bg-white p-6 shadow-sm md:p-8',
          className
        )}
      >
        <div className="mb-3 space-y-3">
          <h2 className="text-xl font-medium text-[hsla(0,0%,7%,1)] md:text-2xl">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-[hsla(0,0%,7%,1)]">{subtitle}</p>
          )}
        </div>

        <div className="mb-6 h-[2px] bg-accent" />

        <div>{children}</div>

        <Image
          src="/assets/image/white-card-geometric-pattern.jpg"
          alt=""
          aria-hidden
          fill
          className="absolute -z-10 object-fill opacity-15"
        />
      </div>
    </main>
  );
};

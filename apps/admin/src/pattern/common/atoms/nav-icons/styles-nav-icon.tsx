'use client';

import React, { useEffect, useState } from 'react';
import { IIconProps } from '@/types';
import { usePathname } from 'next/navigation';
import { NAV_ICON_ACTIVE, NAV_ICON_INACTIVE } from '@/lib/constants';
import { APP_ROUTES } from '@/lib/routes';

export const StylesNavIcon = ({ width, height }: IIconProps) => {
  const pathname = usePathname();
  const [color, setColor] = useState<string>(`${NAV_ICON_INACTIVE}`);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (pathname.startsWith(`${APP_ROUTES.productsStyles}`)) {
      setColor(`${NAV_ICON_ACTIVE}`);
    } else {
      setColor(`${NAV_ICON_INACTIVE}`);
    }
  }, [pathname]);

  const displayColor = isHovered ? 'var(--secondary)' : color;

  return (
    <svg
      width={width ?? '24'}
      height={height ?? '24'}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Layered swatches — a style library */}
      <rect x="4" y="3" width="16" height="5.4" rx="1.8" fill="currentColor" />
      <rect
        x="4"
        y="9.8"
        width="16"
        height="5.4"
        rx="1.8"
        fill="currentColor"
        opacity="0.65"
      />
      <rect
        x="4"
        y="16.6"
        width="16"
        height="5.4"
        rx="1.8"
        fill="currentColor"
        opacity="0.35"
      />
    </svg>
  );
};

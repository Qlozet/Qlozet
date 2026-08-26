'use client';

import React, { useEffect, useState } from 'react';
import { IIconProps } from '@/types';
import { usePathname } from 'next/navigation';
import { NAV_ICON_ACTIVE, NAV_ICON_INACTIVE } from '@/lib/constants';
import { APP_ROUTES } from '@/lib/routes';

export const CollectionsNavIcon = ({ width, height }: IIconProps) => {
  const pathname = usePathname();
  const [color, setColor] = useState<string>(`${NAV_ICON_INACTIVE}`);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (pathname.startsWith(`${APP_ROUTES.productsCollections}`)) {
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
      <rect x="3" y="3" width="8.2" height="8.2" rx="2.2" fill={displayColor} />
      <rect
        x="12.8"
        y="3"
        width="8.2"
        height="8.2"
        rx="2.2"
        fill={displayColor}
        opacity="0.6"
      />
      <rect
        x="3"
        y="12.8"
        width="8.2"
        height="8.2"
        rx="2.2"
        fill={displayColor}
        opacity="0.6"
      />
      <rect
        x="12.8"
        y="12.8"
        width="8.2"
        height="8.2"
        rx="2.2"
        fill={displayColor}
      />
    </svg>
  );
};

'use client';

import React, { useEffect, useState } from 'react';
import { IIconProps } from '@/types';
import { usePathname } from 'next/navigation';
import { NAV_ICON_ACTIVE, NAV_ICON_INACTIVE } from '@/lib/constants';
import { APP_ROUTES } from '@/lib/routes';

export const DisputesNavIcon = ({ width, height }: IIconProps) => {
  const pathname = usePathname();
  const [color, setColor] = useState<string>(`${NAV_ICON_INACTIVE}`);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (pathname.startsWith(`${APP_ROUTES.disputes}`)) {
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
      {/* Gavel / arbitration mark */}
      <rect
        x="2.6"
        y="18.4"
        width="12"
        height="2.6"
        rx="1.3"
        fill={displayColor}
      />
      <rect
        x="12.2"
        y="3.1"
        width="3"
        height="8"
        rx="1.5"
        transform="rotate(45 12.2 3.1)"
        fill={displayColor}
      />
      <rect
        x="15.4"
        y="9.4"
        width="3"
        height="8"
        rx="1.5"
        transform="rotate(45 15.4 9.4)"
        fill={displayColor}
        opacity="0.6"
      />
    </svg>
  );
};

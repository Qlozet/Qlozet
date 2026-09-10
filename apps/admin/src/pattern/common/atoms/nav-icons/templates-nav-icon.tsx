'use client';

import React, { useEffect, useState } from 'react';
import { IIconProps } from '@/types';
import { usePathname } from 'next/navigation';
import { NAV_ICON_ACTIVE, NAV_ICON_INACTIVE } from '@/lib/constants';
import { APP_ROUTES } from '@/lib/routes';

export const TemplatesNavIcon = ({ width, height }: IIconProps) => {
  const pathname = usePathname();
  const [color, setColor] = useState<string>(`${NAV_ICON_INACTIVE}`);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (pathname.startsWith(`${APP_ROUTES.productsTemplates}`)) {
      setColor(`${NAV_ICON_ACTIVE}`);
    } else {
      setColor(`${NAV_ICON_INACTIVE}`);
    }
  }, [pathname]);

  const displayColor = isHovered ? 'var(--secondary)' : color;

  // Sparkle-over-garment: templates are AI-assisted starting points.
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
      <rect
        x="4"
        y="4"
        width="9"
        height="9"
        rx="2"
        stroke={displayColor}
        strokeWidth="1.6"
      />
      <rect
        x="11"
        y="11"
        width="9"
        height="9"
        rx="2"
        stroke={displayColor}
        strokeWidth="1.6"
      />
      <path
        d="M17.5 4.5l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6.6-1.4z"
        fill={displayColor}
      />
    </svg>
  );
};

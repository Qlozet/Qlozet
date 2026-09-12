'use client';

import React, { useEffect, useState } from 'react';
import { IIconProps } from '@/types';
import { usePathname } from 'next/navigation';
import { NAV_ICON_ACTIVE, NAV_ICON_INACTIVE } from '@/lib/constants';
import { APP_ROUTES } from '@/lib/routes';

export const HelpCenterNavIcon = ({ width, height }: IIconProps) => {
  const pathname = usePathname();
  const [color, setColor] = useState<string>(`${NAV_ICON_INACTIVE}`);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (pathname.startsWith(`${APP_ROUTES.helpCenter}`)) {
      setColor(`${NAV_ICON_ACTIVE}`);
    } else {
      setColor(`${NAV_ICON_INACTIVE}`);
    }
  }, [pathname]);

  const displayColor = isHovered ? 'var(--secondary)' : color;

  // Open book with a question mark — the knowledge base.
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
      <path
        d="M12 6.5C10.8 5.3 9 4.75 7 4.75H4v13h3c2 0 3.8.55 5 1.75 1.2-1.2 3-1.75 5-1.75h3v-13h-3c-2 0-3.8.55-5 1.75z"
        stroke={displayColor}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M12 6.5v13" stroke={displayColor} strokeWidth="1.6" />
      <path
        d="M15.2 9.4c.3-.7 1-1.15 1.8-1.15 1.05 0 1.9.75 1.9 1.7 0 .95-.85 1.35-1.9 1.9v.75"
        stroke={displayColor}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="17" cy="15" r="0.9" fill={displayColor} />
    </svg>
  );
};

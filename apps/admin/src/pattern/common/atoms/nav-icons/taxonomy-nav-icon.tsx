'use client';

import React, { useEffect, useState } from 'react';
import { IIconProps } from '@/types';
import { usePathname } from 'next/navigation';
import { NAV_ICON_ACTIVE, NAV_ICON_INACTIVE } from '@/lib/constants';
import { APP_ROUTES } from '@/lib/routes';

export const TaxonomyNavIcon = ({ width, height }: IIconProps) => {
  const pathname = usePathname();
  const [color, setColor] = useState<string>(`${NAV_ICON_INACTIVE}`);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (pathname.startsWith(`${APP_ROUTES.productsTaxonomy}`)) {
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
      {/* A branching tree — one root node fanning into three children */}
      <rect
        x="9.4"
        y="3"
        width="5.2"
        height="5.2"
        rx="1.6"
        fill="currentColor"
      />
      <path
        d="M12 8.2v3M12 11.2H5.4v2.2M12 11.2h6.6v2.2M12 11.2v2.2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <rect
        x="3"
        y="15.4"
        width="4.8"
        height="4.8"
        rx="1.5"
        fill="currentColor"
        opacity="0.65"
      />
      <rect
        x="9.6"
        y="15.4"
        width="4.8"
        height="4.8"
        rx="1.5"
        fill="currentColor"
        opacity="0.65"
      />
      <rect
        x="16.2"
        y="15.4"
        width="4.8"
        height="4.8"
        rx="1.5"
        fill="currentColor"
        opacity="0.65"
      />
    </svg>
  );
};

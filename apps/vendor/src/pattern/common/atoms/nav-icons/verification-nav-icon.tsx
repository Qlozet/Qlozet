'use client';

import React, { useEffect, useState } from 'react';
import { IIconProps } from '@/types';
import { usePathname } from 'next/navigation';
import { NAV_ICON_ACTIVE, NAV_ICON_INACTIVE } from '@/lib/constants';
import { APP_ROUTES } from '@/lib/routes';

// Shield-with-check — the Get Verified page.
export const VerificationNavIcon = ({ width, height }: IIconProps) => {
  const pathname = usePathname();
  const [color, setColor] = useState<string>(`${NAV_ICON_INACTIVE}`);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (pathname.startsWith(`${APP_ROUTES.verification}`)) {
      setColor(`${NAV_ICON_ACTIVE}`);
    } else {
      setColor(`${NAV_ICON_INACTIVE}`);
    }
  }, [pathname]);

  const displayColor = isHovered ? 'var(--secondary)' : color;

  return (
    <>
      <svg
        width={width ?? '20'}
        height={height ?? '19'}
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <path
          d="M10 0.9375L10.291 1.05762L17.791 4.18262L18.4375 4.45215V5.15234C18.4375 11.0921 15.377 16.0713 10.3437 18.9111L10 19.1064L9.65625 18.9111C4.62305 16.0713 1.5625 11.0921 1.5625 5.15234V4.45215L2.20898 4.18262L9.70898 1.05762L10 0.9375ZM13.6543 6.7207L9.0625 11.3115L6.7207 8.9707L5.4668 10.2246L9.0625 13.8203L14.9082 7.97461L13.6543 6.7207Z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="0.4"
          style={{ color: displayColor }}
        />
      </svg>
    </>
  );
};

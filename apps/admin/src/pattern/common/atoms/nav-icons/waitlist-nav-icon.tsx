'use client';

import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ClipboardList } from 'lucide-react';
import type { IIconProps } from '@/types';
import { NAV_ICON_ACTIVE, NAV_ICON_INACTIVE } from '@/lib/constants';
import { APP_ROUTES } from '@/lib/routes';
import { cn } from '@/lib/utils';

export const WaitlistNavIcon = ({ width, height, className }: IIconProps) => {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);
  const active = pathname.startsWith(APP_ROUTES.waitlist);
  const color = isHovered
    ? 'var(--secondary)'
    : active
      ? NAV_ICON_ACTIVE
      : NAV_ICON_INACTIVE;

  return (
    <ClipboardList
      width={width ?? 24}
      height={height ?? 24}
      color={color}
      className={cn(className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    />
  );
};

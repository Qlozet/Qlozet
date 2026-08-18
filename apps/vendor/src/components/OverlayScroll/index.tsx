'use client';

import React from 'react';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import { cn } from '@/lib/utils';

// Reusable floating scrollbar for modal/drawer bodies (and anywhere else).
// The bar floats OVER the content and auto-hides — content keeps full width and
// never shifts when it appears/disappears, matching the main content + mobile.
// Drop-in for a `<div className="... overflow-y-auto">` scroll body.
interface OverlayScrollProps {
  children: React.ReactNode;
  className?: string;
  /** 'leave' shows while the pointer is over the area; 'scroll' only while scrolling. */
  autoHide?: 'leave' | 'scroll' | 'move' | 'never';
}

export const OverlayScroll: React.FC<OverlayScrollProps> = ({
  children,
  className,
  autoHide = 'leave',
}) => {
  return (
    <OverlayScrollbarsComponent
      className={cn('os-host', className)}
      options={{
        scrollbars: {
          theme: 'os-theme-qlozet',
          autoHide,
          autoHideDelay: 500,
        },
        overflow: { x: 'hidden' },
      }}
      defer
    >
      {children}
    </OverlayScrollbarsComponent>
  );
};

export default OverlayScroll;

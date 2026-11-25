'use client';

import type React from 'react';
import { useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface INavLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  exact?: boolean;
  isActive?: boolean;
  children: React.ReactNode;
  className?: string;
  innerRef?: React.LegacyRef<HTMLAnchorElement>;
  onToggle?: () => void;
}

// The nav icons draw with `currentColor`, so the icon shade is set on the link
// rather than inside each SVG. Inactive icons stay lighter than the label
// (NAV_ICON_INACTIVE), matching the admin app.
const activeStyle = `bg-muted text-foreground [&_svg]:text-primary dark:[&_svg]:text-foreground`;

const NavLink = ({
  href,
  exact,
  children,
  isActive = false,
  innerRef,
  className,
  onToggle,
  ...props
}: INavLinkProps) => {
  const pathname = usePathname();

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    }
  };

  const isActiveState = useCallback(() => {
    const activeStatus = exact ? pathname === href : pathname.startsWith(href);
    return activeStatus;
  }, [exact, href, pathname]);

  return (
    <>
      <Link
        href={href}
        className={cn(
          'w-fit 2xl:w-full flex items-center gap-3 px-2 2xl:px-3 h-9 2xl:h-10 rounded-[8px] text-muted-foreground [&_svg]:text-muted-foreground hover:bg-muted/60 hover:text-foreground hover:[&_svg]:text-foreground transition-colors duration-150 text-sm font-normal',
          (isActiveState() || isActive) && activeStyle,
          className
        )}
        onClick={handleToggle}
        ref={innerRef}
        {...props}
      >
        {children}
      </Link>
    </>
  );
};

export default NavLink;

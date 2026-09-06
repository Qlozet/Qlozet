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
// rather than inside each SVG — matching the vendor app: inactive icons stay
// lighter than the label, active ones go primary (white in dark mode).
const activeStyle = `font-semibold text-primary dark:text-white font-normal [&_svg]:text-primary dark:[&_svg]:text-white`;

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

  // `onToggle` has to survive an onClick arriving through `props` — Radix's
  // TooltipTrigger injects one when it clones this element, and a bare
  // `{...props}` spread would drop the handler below on the floor.
  const handleToggle = (event: React.MouseEvent<HTMLAnchorElement>) => {
    props.onClick?.(event);
    onToggle?.();
  };

  const isActiveState = useCallback(() => {
    const activeStatus = exact ? pathname === href : pathname.startsWith(href);
    return activeStatus;
  }, [exact, href, pathname]);

  return (
    <>
      <Link
        {...props}
        href={href}
        className={cn(
          'w-fit 2xl:w-full flex items-center gap-3 px-2 2xl:px-4 py-2 2xl:py-3 text-grey4 dark:text-gray-400 [&_svg]:text-[#ACB5BD] hover:text-secondary dark:hover:text-white hover:[&_svg]:text-secondary dark:hover:[&_svg]:text-white transition-colors text-sm font-normal duration-300',
          (isActiveState() || isActive) && activeStyle,
          className
        )}
        onClick={handleToggle}
        ref={innerRef}
      >
        {children}
      </Link>
    </>
  );
};

export default NavLink;

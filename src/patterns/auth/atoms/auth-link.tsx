"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface AuthLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  icon?: string;
  iconAlt?: string;
}

export const AuthLink: React.FC<AuthLinkProps> = ({
  href,
  children,
  className = '',
  icon,
  iconAlt = '',
}) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(href);
  };

  return (
    <div
      onClick={handleClick}
      className={`
        flex items-center gap-2 cursor-pointer text-primary hover:text-primary/80 
        transition-colors text-sm font-medium
        ${className}
      `}
    >
      {children}
      {icon && (
        <Image src={icon} alt={iconAlt} width={16} height={16} />
      )}
    </div>
  );
};
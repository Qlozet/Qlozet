// Profile Tab Button - Atom
// Tab button for profile sections (Organization/User profile)

import React from 'react';
import { cn } from '@/lib/utils';

interface ProfileTabButtonProps {
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

export const ProfileTabButton: React.FC<ProfileTabButtonProps> = ({
  isActive,
  onClick,
  children,
  className,
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-6 py-3 text-sm font-medium transition-all duration-200 rounded-lg',
        isActive
          ? 'bg-[#5C2D0D] text-white'
          : 'bg-transparent text-[#333333] hover:bg-gray-100',
        className
      )}
    >
      {children}
    </button>
  );
};

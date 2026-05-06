// Settings Tab Button - Atom
// Individual tab button for settings navigation

import React from 'react';
import { cn } from '@/lib/utils';

interface SettingsTabButtonProps {
  children: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  className?: string;
}

export const SettingsTabButton: React.FC<SettingsTabButtonProps> = ({
  children,
  isActive,
  onClick,
  className,
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200',
        isActive
          ? 'bg-primary text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
        className
      )}
    >
      {children}
    </button>
  );
};

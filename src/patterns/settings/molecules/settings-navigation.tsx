// Settings Navigation - Molecule
// Navigation tabs for settings sections

import React from 'react';
import { cn } from '@/lib/utils';
import { SettingsTabButton } from '../atoms/settings-tab-button';

interface NavigationItem {
  item: string;
  navWidth?: string;
  handleFunction: (item: string) => void;
}

interface SettingsNavigationProps {
  navigationItems: NavigationItem[];
  activeTab: string;
  className?: string;
}

export const SettingsNavigation: React.FC<SettingsNavigationProps> = ({
  navigationItems,
  activeTab,
  className
}) => {
  return (
    <div className={cn("mt-4", className)}>
      <div className="flex flex-wrap gap-2 p-1 bg-gray-50 rounded-lg">
        {navigationItems.map((navItem, index) => (
          <SettingsTabButton
            key={index}
            isActive={activeTab === navItem.item}
            onClick={() => navItem.handleFunction(navItem.item)}
            className={navItem.navWidth}
          >
            {navItem.item}
          </SettingsTabButton>
        ))}
      </div>
    </div>
  );
};
// Settings Navigation - Molecule
// Navigation tabs for settings sections (styled like notification category tabs)

import React from 'react';
import { cn } from '@/lib/utils';
import {
  User,
  Warehouse,
  Users,
  Package,
  Shield,
  CreditCard,
  Store,
  LayoutList,
  type LucideIcon,
} from 'lucide-react';

const TAB_ICONS: Record<string, LucideIcon> = {
  Profile: User,
  'Shop details': Store,
  Warehouses: Warehouse,
  'Users and permissions': Users,
  'Order Settings': Package,
  Security: Shield,
  Billing: CreditCard,
  Categories: LayoutList,
};

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
  className,
}) => {
  return (
    <div className={cn('mt-4', className)}>
      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-none">
        {navigationItems?.map((navItem, index) => {
          const isActive = activeTab === navItem.item;
          const Icon = TAB_ICONS[navItem.item] || User;
          return (
            <button
              key={index}
              type="button"
              onClick={() => navItem.handleFunction(navItem.item)}
              className={cn(
                'flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors shrink-0',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-accent dark:bg-muted text-foreground hover:bg-primary/10'
              )}
            >
              <Icon className="size-3.5" />
              {navItem.item}
            </button>
          );
        })}
      </div>
    </div>
  );
};

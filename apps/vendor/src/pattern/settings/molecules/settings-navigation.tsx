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
    <div className={cn('mt-4 border-b border-border', className)}>
      {/* overflow-y-hidden: with only overflow-x set, CSS computes overflow-y
          to auto, and the tabs' -mb-px overhang is enough to show a vertical
          scrollbar. */}
      <div className="flex gap-6 overflow-x-auto overflow-y-hidden scrollbar-none">
        {navigationItems?.map((navItem, index) => {
          const isActive = activeTab === navItem.item;
          const Icon = TAB_ICONS[navItem.item] || User;
          return (
            <button
              key={index}
              type="button"
              onClick={() => navItem.handleFunction(navItem.item)}
              // The active tab's border sits on the container's own bottom
              // border, so the underline reads as part of one continuous rule.
              className={cn(
                'flex shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap border-b-2 px-1 pb-1.5 text-sm transition-colors -mb-px',
                isActive
                  ? 'border-primary text-primary font-semibold'
                  : 'border-transparent text-grey3 hover:text-foreground'
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

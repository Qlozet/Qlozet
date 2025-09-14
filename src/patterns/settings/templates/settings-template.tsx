// Settings Template - Template
// Complete settings page template with navigation and content areas

import React from 'react';
import { cn } from '@/lib/utils';
import { SettingsNavigation } from '../molecules/settings-navigation';
import { SettingsContent } from '../organisms/settings-content';

interface NavigationItem {
  item: string;
  navWidth?: string;
  handleFunction: (item: string) => void;
}

interface ShopDetails {
  companyName: string;
  addressLine1: string;
  addressLine2: string;
  state: string;
  timeZone: string;
  Phone: string;
  email: string;
  city: string;
  country: string;
  nin: string;
  bvn: string;
  logo: string[];
  cacDocs: string[];
}

interface SettingsTemplateProps {
  navigationItems: NavigationItem[];
  activeTab: string;
  shopDetails: ShopDetails;
  className?: string;
}

export const SettingsTemplate: React.FC<SettingsTemplateProps> = ({
  navigationItems,
  activeTab,
  shopDetails,
  className
}) => {
  return (
    <section className={cn("", className)}>
      <div className="flex bg-[#F8F9FA]">
        <div className="w-full p-4">
          <SettingsNavigation
            navigationItems={navigationItems}
            activeTab={activeTab}
          />
          
          <SettingsContent
            activeTab={activeTab}
            shopDetails={shopDetails}
          />
        </div>
      </div>
    </section>
  );
};

export default SettingsTemplate;
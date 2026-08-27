// Settings Content - Organism
// Main settings content area that renders different sections based on active tab

import React from 'react';
import { CompanyDetailsForm } from '../molecules/company-details-form';
import { ProfileContent } from './profile-content';
import { useUpdateVendorDetailsMutation } from '@/redux/services/settings/settings.api-slice';
import { type CompanyDetailsData } from '@/lib/validations/settings';
import { toast } from 'sonner';

// Import existing components for other sections
// TODO(api): restore alongside the Billing tab.
// import BillingAndInvoice from '@/components/Settings/BillingAndInvioceInfo';
import { WarehouseContent } from './warehouse-content';
import UserAndPermission from '@/components/Settings/UserAndPermission/UserAndPermssion';
import Category from '@/components/Settings/Category/Category';
import { OrderSettingsContent } from './order-settings-content';
import { PayoutContent } from './payout-content';
import { readApiError } from '@/redux/services/types';

interface SettingsContentProps {
  activeTab: string;
  shopDetails: {
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
    vendorName?: string;
  };
}

export const SettingsContent: React.FC<SettingsContentProps> = ({
  activeTab,
  shopDetails,
}) => {
  const [updateVendorDetails, { isLoading: isUpdating }] =
    useUpdateVendorDetailsMutation();

  const handleCompanyDetailsSubmit = async (data: CompanyDetailsData) => {
    try {
      const response = await updateVendorDetails(data).unwrap();
      if (response.success) {
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    } catch (error: any) {
      toast.error(readApiError(error, 'An error occurred'));
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Profile':
        return <ProfileContent />;

      case 'Shop details':
        return (
          <CompanyDetailsForm
            initialData={{
              companyName: shopDetails.companyName,
              addressLine1: shopDetails.addressLine1,
              addressLine2: shopDetails.addressLine2,
              state: shopDetails.state,
              city: shopDetails.city,
              country: shopDetails.country,
              timeZone: shopDetails.timeZone,
              phone: shopDetails.Phone,
              email: shopDetails.email,
              nin: shopDetails.nin,
              bvn: shopDetails.bvn,
              logo: shopDetails.logo,
              cacDocs: shopDetails.cacDocs,
            }}
            onSubmit={handleCompanyDetailsSubmit}
            isLoading={isUpdating}
          />
        );

      // TODO(api): Billing and Security are hidden from the nav (see
      // lib/settings-tabs.ts) until endpoints exist — the forms were wired to
      // empty handlers.
      // case 'Billing':
      //   return <BillingAndInvoice />;

      case 'Warehouses':
        return <WarehouseContent />;

      case 'Users and permissions':
        return <UserAndPermission />;

      case 'Categories':
        return <Category />;

      case 'Order Settings':
        return <OrderSettingsContent />;

      case 'Payout':
        return <PayoutContent />;

      // case 'Security':
      //   return <SecurityContent />;

      default:
        return null;
    }
  };

  return <div className="mt-6">{renderContent()}</div>;
};

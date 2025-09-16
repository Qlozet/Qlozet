// Settings Content - Organism
// Main settings content area that renders different sections based on active tab

import React from 'react';
import { CompanyDetailsForm } from '../molecules/company-details-form';
import { useUpdateVendorDetailsMutation } from '@/redux/services/settings/settings.api-slice';
import { type CompanyDetailsData } from '@/lib/validations/settings';
import toast from 'react-hot-toast';
import Toast from '@/components/ToastComponent/toast';

// Import existing components for other sections
import BillingAndInvoice from '@/components/Settings/BillingAndInvioceInfo';
import Warehouse from '@/components/Settings/Warehouse/Warehouse';
import UserAndPermission from '@/components/Settings/UserAndPermission/UserAndPermssion';
import Category from '@/components/Settings/Category/Category';
import OrderSetting from '@/components/Settings/OrderSettings/OrderSettings';

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
  };
}

export const SettingsContent: React.FC<SettingsContentProps> = ({
  activeTab,
  shopDetails
}) => {
  const [updateVendorDetails, { isLoading: isUpdating }] = useUpdateVendorDetailsMutation();

  const handleCompanyDetailsSubmit = async (data: CompanyDetailsData) => {
    try {
      const response = await updateVendorDetails(data).unwrap();
      if (response.success) {
        toast(<Toast text={response.message} type="success" />);
      } else {
        toast(<Toast text={response.message} type="danger" />);
      }
    } catch (error: any) {
      toast(<Toast text={error?.data?.message || "An error occurred"} type="danger" />);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "Shop details":
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
      
      case "Billing and invoice":
        return <BillingAndInvoice />;
      
      case "Warehouses":
        return <Warehouse />;
      
      case "Users and permissions":
        return <UserAndPermission />;
      
      case "Categories":
        return <Category />;
      
      case "Order Settings":
        return <OrderSetting />;
      
      default:
        return null;
    }
  };

  return (
    <div className="mt-6">
      {renderContent()}
    </div>
  );
};
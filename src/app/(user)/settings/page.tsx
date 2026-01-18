'use client';
import { Suspense, useEffect, useState } from 'react';
import { SettingsTemplate } from '@/pattern/settings/templates/settings-template';
import { useGetVendorDetailsQuery } from '@/redux/services/settings/settings.api-slice';
import Loader from '@/components/Loader';
const Dashboard: React.FC = () => {
  const [currentNav, setCurrentNav] = useState('Profile');
  const { data: vendorData, isLoading: isLoadingVendor } =
    useGetVendorDetailsQuery();

  const [shopDetails, setShopDetails] = useState({
    vendorName: '',
    companyName: '',
    addressLine1: '',
    addressLine2: '',
    state: '',
    timeZone: '',
    Phone: '',
    email: '',
    city: '',
    country: '',
    nin: '',
    bvn: '',
    logo: [''],
    cacDocs: [''],
  });
  const settingNav = [
    {
      item: 'Profile',
      link: '',
      navWidth: 'min-w-[7.5rem] lg:min-w-w-[0]',
      handleFunction: (data: string) => {
        setCurrentNav(data);
      },
    },
    {
      item: 'Warehouses',
      navWidth: 'min-w-[8rem] lg:min-w-w-[0]',
      link: '',
      handleFunction: (data: string) => {
        setCurrentNav(data);
      },
    },
    {
      item: 'Users and permissions',
      link: '',
      navWidth: 'min-w-[13rem] lg:min-w-w-[0]',
      handleFunction: (data: string) => {
        setCurrentNav(data);
      },
    },
    {
      item: 'Order Settings',
      link: '',
      navWidth: 'min-w-[13rem] lg:min-w-w-[0]',
      handleFunction: (data: string) => {
        setCurrentNav(data);
      },
    },
    {
      item: 'Security',
      link: '',
      navWidth: 'min-w-[8rem] lg:min-w-w-[0]',
      handleFunction: (data: string) => {
        setCurrentNav(data);
      },
    },
    {
      item: 'Billing',
      navWidth: 'min-w-[7.5rem] lg:min-w-w-[0]',
      handleFunction: (data: string) => {
        setCurrentNav(data);
      },
    },
  ];

  // Update shop details when vendor data loads
  useEffect(() => {
    if (vendorData?.data) {
      setShopDetails({
        vendorName: vendorData.data.businessName,
        companyName: vendorData.data.businessName,
        addressLine1: vendorData.data.businessAddress,
        addressLine2: vendorData.data.addressLine2 || '',
        state: vendorData.data.state,
        timeZone: vendorData.data.timeZone,
        Phone: vendorData.data.businessPhoneNumber,
        email: vendorData.data.businessEmail,
        city: vendorData.data.city,
        country: vendorData.data.country,
        nin: vendorData.data.nin || '',
        bvn: vendorData.data.bvn || '',
        logo: [''],
        cacDocs: [''],
      });
    }
  }, [vendorData]);

  if (isLoadingVendor) {
    return <Loader />;
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SettingsTemplate
        navigationItems={settingNav}
        activeTab={currentNav}
        shopDetails={shopDetails}
      />
    </Suspense>
  );
};

export default Dashboard;

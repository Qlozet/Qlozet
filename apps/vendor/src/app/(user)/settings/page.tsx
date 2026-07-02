'use client';
import { Suspense, useState } from 'react';
import { SettingsTemplate } from '@/pattern/settings/templates/settings-template';
import Loader from '@/components/Loader';

const SettingsPage: React.FC = () => {
  const [currentNav, setCurrentNav] = useState('Profile');

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

  return (
    <Suspense fallback={<Loader />}>
      <SettingsTemplate
        navigationItems={settingNav}
        activeTab={currentNav}
        shopDetails={{
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
        }}
      />
    </Suspense>
  );
};

export default SettingsPage;

// Profile Content - Organism
// Profile section with Organization/User profile tabs and vendor card

import React, { useState } from 'react';
import { ProfileTabButton } from '../atoms/profile-tab-button';
import { OrganizationProfileForm } from '../molecules/organization-profile-form';
import { UserProfileForm } from '../molecules/user-profile-form';
import { VendorProfileCard } from '../molecules/vendor-profile-card';
import { UserProfileCard } from '../molecules/user-profile-card';

interface ProfileContentProps {
  shopDetails: {
    companyName: string;
    addressLine1: string;
    state: string;
    Phone: string;
    email: string;
    country: string;
    vendorName?: string;
    nin?: string;
  };
  onOrganizationProfileSubmit?: (data: any) => void;
  onUserProfileSubmit?: (data: any) => void;
  isLoading?: boolean;
  userData?: {
    fullName?: string;
    username?: string;
    registrationId?: string;
  };
}

export const ProfileContent: React.FC<ProfileContentProps> = ({
  shopDetails,
  onOrganizationProfileSubmit,
  onUserProfileSubmit,
  isLoading = false,
  userData,
}) => {
  const [activeProfileTab, setActiveProfileTab] = useState<
    'organization' | 'user'
  >('organization');

  const handleOrganizationSubmit = (data: any) => {
    if (onOrganizationProfileSubmit) {
      onOrganizationProfileSubmit(data);
    }
  };

  const handleUserProfileSubmit = (data: any) => {
    if (onUserProfileSubmit) {
      onUserProfileSubmit(data);
    }
  };

  return (
    <div className='space-y-6'>
      {/* Profile Tabs */}
      <div className='flex gap-4 border-b border-gray-200 pb-2'>
        <ProfileTabButton
          isActive={activeProfileTab === 'organization'}
          onClick={() => setActiveProfileTab('organization')}
        >
          Organization profile
        </ProfileTabButton>
        <ProfileTabButton
          isActive={activeProfileTab === 'user'}
          onClick={() => setActiveProfileTab('user')}
        >
          User profile
        </ProfileTabButton>
      </div>

      {/* Two Column Layout */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Left Column - Form */}
        <div className='lg:col-span-2'>
          {activeProfileTab === 'organization' ? (
            <OrganizationProfileForm
              initialData={{
                country: shopDetails.country || '',
                state: shopDetails.state || '',
                address: shopDetails.addressLine1 || '',
                email: shopDetails.email || '',
                phoneNumber: shopDetails.Phone || '',
                website: '',
                registrationId: '',
                about: '',
              }}
              onSubmit={handleOrganizationSubmit}
              isLoading={isLoading}
            />
          ) : (
            <UserProfileForm
              initialData={{
                country: shopDetails.country || '',
                phoneNumber: shopDetails.Phone || '',
                email: shopDetails.email || '',
                address: shopDetails.addressLine1 || '',
                nin: shopDetails.nin || '',
                fullName: userData?.fullName || '',
                username: userData?.username || '',
              }}
              onSubmit={handleUserProfileSubmit}
              isLoading={isLoading}
            />
          )}
        </div>

        {/* Right Column - Profile Cards */}
        <div className='lg:col-span-1'>
          {activeProfileTab === 'organization' ? (
            <VendorProfileCard
              vendorName={shopDetails.vendorName || shopDetails.companyName}
              registrationId='QLOZETII15009'
              website='www.garmisland.com'
              status='pending'
            />
          ) : (
            <UserProfileCard
              fullName={userData?.fullName || 'John Doe'}
              registrationId={userData?.registrationId || 'QLOZETII15009'}
              email={shopDetails.email || 'john.d@garmisland.com'}
            />
          )}
        </div>
      </div>
    </div>
  );
};

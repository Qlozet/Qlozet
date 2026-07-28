// Profile Content - Organism
// Profile section with Organization/User profile tabs and vendor card
// Now fetches data directly from backend API

import React, { useState } from 'react';
import { ProfileTabButton } from '../atoms/profile-tab-button';
import { OrganizationProfileForm } from '../molecules/organization-profile-form';
import { UserProfileForm } from '../molecules/user-profile-form';
import { VendorProfileCard } from '../molecules/vendor-profile-card';
import { UserProfileCard } from '../molecules/user-profile-card';
import {
  useGetBusinessProfileQuery,
  useUpdateBusinessProfileMutation,
  useUpdateBusinessProfileDetailsMutation,
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
} from '@/redux/services/settings/settings.api-slice';
import type {
  UpdateBusinessProfilePayload,
  UpdateBusinessProfileDetailsPayload,
  UpdateUserProfilePayload,
} from '@/redux/services/settings/settings.api-slice';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

interface ProfileContentProps {
  shopDetails?: any; // kept for backward compat, but no longer used
  onOrganizationProfileSubmit?: (data: any) => void;
  onUserProfileSubmit?: (data: any) => void;
  isLoading?: boolean;
  userData?: any;
}

// Skeleton that mirrors the profile layout (form card + tabs on the left,
// profile card + upload buttons on the right) so the shape doesn't jump when
// the data loads.
const ProfileContentSkeleton: React.FC = () => (
  <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
    {/* Left — form card */}
    <div className='lg:col-span-2 bg-white dark:bg-card dark:border dark:border-white/10 rounded-[12px] p-4 lg:p-8 custom-card-shadow'>
      {/* Tab pill */}
      <Skeleton className='mb-8 h-11 w-full rounded-[10px]' />

      {/* Form fields */}
      <div className='grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2'>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className='space-y-2'>
            <Skeleton className='h-3 w-24' />
            <Skeleton className='h-11 w-full rounded-lg' />
          </div>
        ))}
      </div>

      {/* About / textarea */}
      <div className='mt-6 space-y-2'>
        <Skeleton className='h-3 w-20' />
        <Skeleton className='h-24 w-full rounded-lg' />
      </div>

      {/* Submit */}
      <Skeleton className='mt-8 h-11 w-40 rounded-lg' />
    </div>

    {/* Right — profile card + upload buttons */}
    <div className='lg:col-span-1 space-y-6'>
      <div className='overflow-hidden rounded-[12px] bg-white pb-6 custom-card-shadow dark:border dark:border-white/10 dark:bg-card'>
        {/* Cover */}
        <Skeleton className='h-32 w-full rounded-none' />
        {/* Avatar + info */}
        <div className='-mt-16 flex flex-col items-center px-6'>
          <Skeleton className='size-24 rounded-full border-4 border-white dark:border-card' />
          <Skeleton className='mt-4 h-5 w-40' />
          <Skeleton className='mt-2 h-3 w-28' />
          <Skeleton className='mt-2 h-3 w-32' />
          <Skeleton className='mt-2 h-3 w-24' />
        </div>
      </div>

      {/* Upload buttons */}
      <div className='space-y-4'>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className='h-14 w-full rounded-[12px]' />
        ))}
      </div>
    </div>
  </div>
);

export const ProfileContent: React.FC<ProfileContentProps> = () => {
  const [activeProfileTab, setActiveProfileTab] = useState<
    'organization' | 'user'
  >('organization');

  // Fetch live data
  const {
    data: businessData,
    isLoading: isLoadingBusiness,
  } = useGetBusinessProfileQuery();

  const {
    data: userData,
    isLoading: isLoadingUser,
  } = useGetUserProfileQuery();

  // Mutations
  const [updateBusiness, { isLoading: isUpdatingBusiness }] =
    useUpdateBusinessProfileMutation();

  const [updateBusinessDetails, { isLoading: isUpdatingBusinessDetails }] =
    useUpdateBusinessProfileDetailsMutation();

  const [updateUser, { isLoading: isUpdatingUser }] =
    useUpdateUserProfileMutation();

  const handleOrganizationSubmit = async (formData: any) => {
    try {
      // Address fields go to PATCH /business/address
      const addressPayload: UpdateBusinessProfilePayload = {
        address: formData.address,
        country: formData.country,
        state: formData.state,
        city: formData.city,
        zip_code: formData.zipCode || '',
        latitude: formData.latitude,
        longitude: formData.longitude,
      };

      // Other fields go to PATCH /business/profile
      const detailsPayload: UpdateBusinessProfileDetailsPayload = {
        business_name: formData.businessName,
        business_email: formData.email,
        business_phone_number: formData.phoneNumber,
        website: formData.website,
        description: formData.about,
        year_founded: formData.yearFounded,
        nin: formData.nin,
        bvn: formData.bvn,
      };

      await Promise.all([
        updateBusiness(addressPayload).unwrap(),
        updateBusinessDetails(detailsPayload).unwrap(),
      ]);
      toast.success('Organization profile updated successfully');
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to update organization profile');
    }
  };

  const handleUserProfileSubmit = async (formData: any) => {
    try {
      const payload: UpdateUserProfilePayload = {
        phone_number: formData.phoneNumber,
        username: formData.username,
      };
      await updateUser(payload).unwrap();
      toast.success('User profile updated successfully');
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to update user profile');
    }
  };

  if (isLoadingBusiness || isLoadingUser) {
    return <ProfileContentSkeleton />;
  }

  return (
    <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
      {/* Left Column - Form Card */}
      <div className='lg:col-span-2 bg-white dark:bg-card dark:border dark:border-white/10 rounded-[12px] p-4 lg:p-8 custom-card-shadow'>
        {/* Profile Tabs Pill Toggle */}
        <div className='flex w-full bg-[#F3F4F6] dark:bg-muted rounded-[10px] p-1 mb-8'>
          <button
            onClick={() => setActiveProfileTab('organization')}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-[8px] transition-all duration-200 ${
              activeProfileTab === 'organization'
                ? 'bg-[#6D5545] text-white shadow-sm dark:bg-white dark:text-black'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-transparent'
            }`}
          >
            Organization
          </button>
          <button
            onClick={() => setActiveProfileTab('user')}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-[8px] transition-all duration-200 ${
              activeProfileTab === 'user'
                ? 'bg-[#6D5545] text-white shadow-sm dark:bg-white dark:text-black'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-transparent'
            }`}
          >
            User
          </button>
        </div>

        {/* Form Content */}
        <div>
          {activeProfileTab === 'organization' ? (
            <OrganizationProfileForm
              initialData={{
                country: businessData?.country || '',
                state: businessData?.state || '',
                address: businessData?.business_address || '',
                yearFounded: businessData?.year_founded || '',
                email: businessData?.business_email || '',
                phoneNumber: businessData?.business_phone_number || '',
                website: businessData?.website || '',
                registrationId: businessData?._id || '',
                about: businessData?.description || '',
                nin: businessData?.nin || '',
                bvn: businessData?.bvn || '',
                businessName: businessData?.business_name || '',
                city: businessData?.city || '',
                timeZone: businessData?.time_zone || '',
              }}
              onSubmit={handleOrganizationSubmit}
              isLoading={isUpdatingBusiness || isUpdatingBusinessDetails}
            />
          ) : (
            <UserProfileForm
              initialData={{
                fullName: userData?.full_name || '',
                username: userData?.username || '',
                email: userData?.email || '',
                phoneNumber: userData?.phone_number || '',
                country: businessData?.country || '',
                address: businessData?.business_address || '',
              }}
              onSubmit={handleUserProfileSubmit}
              isLoading={isUpdatingUser}
            />
          )}
        </div>
      </div>

        {/* Right Column - Profile Cards */}
        <div className='lg:col-span-1'>
          {activeProfileTab === 'organization' ? (
            <VendorProfileCard
              vendorName={businessData?.business_name || 'Business'}
              registrationId={businessData?._id || ''}
              website={businessData?.website || ''}
              status={(businessData?.status as any) || 'pending'}
              logoUrl={businessData?.business_logo_url}
              svgLogoUrl={businessData?.business_logo_svg_url}
              coverImageUrl={businessData?.cover_image_url}
            />
          ) : (
            <UserProfileCard
              fullName={userData?.full_name || ''}
              registrationId={businessData?._id || ''}
              email={userData?.email || ''}
              profilePicture={userData?.profile_picture}
            />
          )}
        </div>
      </div>
  );
};

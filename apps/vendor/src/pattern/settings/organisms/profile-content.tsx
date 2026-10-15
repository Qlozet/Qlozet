// Profile tab: the store hero (cover, logo, status, storefront link, how
// complete the profile is), then "Store profile" or "Your account" below it.
// Data comes straight from the API; saves send only what changed.

import React, { useCallback, useState } from 'react';
import { CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';
import { OrganizationProfileForm } from '../molecules/organization-profile-form';
import { UserProfileForm } from '../molecules/user-profile-form';
import { VendorProfileCard } from '../molecules/vendor-profile-card';
import { UserProfileCard } from '../molecules/user-profile-card';
import { profileCompleteness } from '../lib/profile-completeness';
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
import { cn } from '@/lib/utils';
import { readApiError } from '@/redux/services/types';

const SHOP_URL =
  process.env.NEXT_PUBLIC_SHOP_URL ?? 'https://qlozet-shop.vercel.app';

/**
 * Only the fields this save actually changed.
 *
 * The form seeds every input from the record with `|| ''`, so a field the
 * business has never set arrives blank and, untouched, submits blank. Sending
 * the whole object would write that blank back as an explicit empty string, and
 * would overwrite anything changed on the record - by an admin, or in another
 * tab - between the load and the save. Comparing against the loaded value,
 * normalised the same way the form normalised it, keeps a save to what the
 * person in front of it actually edited.
 */
const changedFields = <T extends object>(
  next: T,
  current: Record<string, unknown>
): Partial<T> => {
  const patch: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(next)) {
    // The form has no input for this one; absent is not the same as cleared.
    if (value === undefined) continue;
    if ((value ?? '') === (current[key] ?? '')) continue;
    patch[key] = value;
  }
  return patch as Partial<T>;
};

interface ProfileContentProps {
  shopDetails?: any; // kept for backward compat, but no longer used
  onOrganizationProfileSubmit?: (data: any) => void;
  onUserProfileSubmit?: (data: any) => void;
  isLoading?: boolean;
  userData?: any;
}

type ProfileTab = 'organization' | 'user';

const ProfileContentSkeleton: React.FC = () => (
  <div className="space-y-6">
    <div className="surface-card overflow-hidden">
      <Skeleton className="h-40 w-full rounded-none" />
      <div className="-mt-12 flex items-end gap-4 px-6 pb-6">
        <Skeleton className="size-24 rounded-full border-4 border-card" />
        <div className="space-y-2 pb-1">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    </div>
    <Skeleton className="h-10 w-64 rounded-lg" />
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="surface-card space-y-6 p-6 lg:col-span-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ))}
      </div>
      <Skeleton className="h-48 w-full rounded-[12px]" />
    </div>
  </div>
);

export const ProfileContent: React.FC<ProfileContentProps> = () => {
  const [activeProfileTab, setActiveProfileTab] =
    useState<ProfileTab>('organization');
  const [orgDirty, setOrgDirty] = useState(false);
  const [userDirty, setUserDirty] = useState(false);

  // refetchOnMountOrArgChange: a fresh fetch whenever Settings opens, so a
  // stale or empty cache (a first fetch that ran before the auth token was
  // ready) cannot leave the profile blank until a full reload.
  const {
    data: businessData,
    isLoading: isLoadingBusiness,
    isFetching: isFetchingBusiness,
    refetch: refetchBusiness,
  } = useGetBusinessProfileQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const {
    data: userData,
    isLoading: isLoadingUser,
    isFetching: isFetchingUser,
    refetch: refetchUser,
  } = useGetUserProfileQuery(undefined, { refetchOnMountOrArgChange: true });

  const [updateBusiness, { isLoading: isUpdatingBusiness }] =
    useUpdateBusinessProfileMutation();
  const [updateBusinessDetails, { isLoading: isUpdatingBusinessDetails }] =
    useUpdateBusinessProfileDetailsMutation();
  const [updateUser, { isLoading: isUpdatingUser }] =
    useUpdateUserProfileMutation();

  const handleOrganizationSubmit = async (formData: any): Promise<boolean> => {
    try {
      // Address fields go to PATCH /business/address, the rest to
      // PATCH /business/profile. Both are diffed against the loaded record.
      const addressPatch = changedFields<UpdateBusinessProfilePayload>(
        {
          address: formData.address,
          country: formData.country,
          state: formData.state,
          city: formData.city,
          zip_code: formData.zipCode,
          latitude: formData.latitude,
          longitude: formData.longitude,
        },
        {
          address: businessData?.business_address,
          country: businessData?.country,
          state: businessData?.state,
          city: businessData?.city,
          zip_code: businessData?.zip_code,
        }
      );

      const detailsPatch = changedFields<UpdateBusinessProfileDetailsPayload>(
        {
          business_name: formData.businessName,
          business_email: formData.email,
          business_phone_number: formData.phoneNumber,
          website: formData.website,
          description: formData.about,
          year_founded: formData.yearFounded,
        },
        {
          business_name: businessData?.business_name,
          business_email: businessData?.business_email,
          business_phone_number: businessData?.business_phone_number,
          website: businessData?.website,
          description: businessData?.description,
          year_founded: businessData?.year_founded,
        }
      );

      // social_links is a sub-document, so changedFields (which diffs flat
      // keys) cannot see into it. All five handles are sent together whenever
      // any one of them changed: PATCH /business/profile does `$set`, which
      // replaces the whole sub-document, so an omitted handle is a cleared
      // handle - which is exactly what an emptied field should mean.
      const SOCIAL_KEYS = [
        'instagram',
        'twitter',
        'tiktok',
        'youtube',
        'pinterest',
      ] as const;
      const savedSocial = (businessData?.social_links ?? {}) as Record<
        string,
        string | undefined
      >;
      const nextSocial: Record<string, string> = {};
      let socialChanged = false;
      for (const key of SOCIAL_KEYS) {
        const value = String(formData[key] ?? '').trim();
        if (value) nextSocial[key] = value;
        if (value !== (savedSocial[key] ?? '')) socialChanged = true;
      }
      if (socialChanged) detailsPatch.social_links = nextSocial;

      const requests = [
        ...(Object.keys(addressPatch).length
          ? [updateBusiness(addressPatch).unwrap()]
          : []),
        ...(Object.keys(detailsPatch).length
          ? [updateBusinessDetails(detailsPatch).unwrap()]
          : []),
      ];

      if (!requests.length) {
        toast.info('No changes to save');
        return false;
      }

      await Promise.all(requests);
      toast.success('Store profile saved');
      return true;
    } catch (error: any) {
      toast.error(readApiError(error, 'Could not save the store profile'));
      return false;
    }
  };

  const handleUserProfileSubmit = async (formData: any): Promise<boolean> => {
    try {
      const patch = changedFields<UpdateUserProfilePayload>(
        { phone_number: formData.phoneNumber, username: formData.username },
        { phone_number: userData?.phone_number, username: userData?.username }
      );
      if (!Object.keys(patch).length) {
        toast.info('No changes to save');
        return false;
      }
      await updateUser(patch).unwrap();
      toast.success('Account saved');
      return true;
    } catch (error: any) {
      toast.error(readApiError(error, 'Could not save your account'));
      return false;
    }
  };

  // Switching tabs with unsaved edits asks first; the forms re-seed on return.
  const switchTab = useCallback(
    (next: ProfileTab) => {
      if (next === activeProfileTab) return;
      const dirty = activeProfileTab === 'organization' ? orgDirty : userDirty;
      if (
        dirty &&
        !window.confirm('You have unsaved changes. Leave without saving?')
      )
        return;
      setActiveProfileTab(next);
    },
    [activeProfileTab, orgDirty, userDirty]
  );

  const jumpTo = (anchor: string) => {
    const go = () =>
      document
        .getElementById(anchor)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (activeProfileTab !== 'organization' && anchor !== 'profile-brand') {
      switchTab('organization');
      setTimeout(go, 50);
    } else {
      go();
    }
  };

  const hasBusiness = !!businessData?._id;
  const busy =
    isLoadingBusiness || isLoadingUser || isFetchingBusiness || isFetchingUser;

  if (!hasBusiness && busy) return <ProfileContentSkeleton />;

  if (!hasBusiness) {
    return (
      <div className="surface-card flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
        <p className="text-sm font-medium text-foreground">
          Couldn&apos;t load your profile
        </p>
        <p className="max-w-sm text-xs text-muted-foreground">
          Something went wrong fetching your store profile. Please try again.
        </p>
        <button
          type="button"
          onClick={() => {
            refetchBusiness();
            refetchUser();
          }}
          className="mt-1 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          Retry
        </button>
      </div>
    );
  }

  const completeness = profileCompleteness(businessData);
  const resetKey = `${businessData?._id ?? ''}:${businessData?.updatedAt ?? ''}:${userData?.phone_number ?? ''}:${userData?.username ?? ''}`;

  const tabs: { key: ProfileTab; label: string; hint: string }[] = [
    { key: 'organization', label: 'Store profile', hint: 'What shoppers see' },
    { key: 'user', label: 'Your account', hint: 'Just you' },
  ];

  return (
    <div className="space-y-6">
      <VendorProfileCard
        vendorName={businessData?.business_name || 'Your store'}
        registrationId={businessData?._id || ''}
        website={businessData?.website || ''}
        status={(businessData?.status as any) || 'pending'}
        logoUrl={businessData?.business_logo_url}
        svgLogoUrl={businessData?.business_logo_svg_url}
        coverImageUrl={businessData?.cover_image_url}
        themeColor={businessData?.theme_color}
        storefrontUrl={
          businessData?._id
            ? `${SHOP_URL}/vendor/${businessData._id}`
            : undefined
        }
        completeness={completeness}
      />

      <div
        role="tablist"
        aria-label="Profile sections"
        className="inline-flex rounded-lg border border-border bg-muted/40 p-1"
      >
        {tabs.map((t) => {
          const active = activeProfileTab === t.key;
          return (
            <button
              key={t.key}
              role="tab"
              type="button"
              aria-selected={active}
              onClick={() => switchTab(t.key)}
              className={cn(
                'flex flex-col items-start rounded-md px-4 py-1.5 text-left transition-colors',
                active
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <span className="text-sm font-semibold">{t.label}</span>
              <span className="text-[11px] opacity-70">{t.hint}</span>
            </button>
          );
        })}
      </div>

      {activeProfileTab === 'organization' ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="surface-card p-5 sm:p-8 lg:col-span-2">
            <OrganizationProfileForm
              initialData={{
                country: businessData?.country || '',
                state: businessData?.state || '',
                address: businessData?.business_address || '',
                yearFounded: businessData?.year_founded || '',
                email: businessData?.business_email || '',
                phoneNumber: businessData?.business_phone_number || '',
                website: businessData?.website || '',
                instagram: businessData?.social_links?.instagram || '',
                twitter: businessData?.social_links?.twitter || '',
                tiktok: businessData?.social_links?.tiktok || '',
                youtube: businessData?.social_links?.youtube || '',
                pinterest: businessData?.social_links?.pinterest || '',
                registrationId: businessData?._id || '',
                about: businessData?.description || '',
                businessName: businessData?.business_name || '',
                city: businessData?.city || '',
                timeZone: businessData?.time_zone || '',
              }}
              resetKey={resetKey}
              onDirtyChange={setOrgDirty}
              onSubmit={handleOrganizationSubmit}
              isLoading={isUpdatingBusiness || isUpdatingBusinessDetails}
            />
          </div>

          <aside className="space-y-6 lg:col-span-1">
            <div className="surface-card p-5">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">
                  {completeness.missing.length
                    ? 'Finish your profile'
                    : 'Looking good'}
                </h3>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {completeness.missing.length
                  ? 'Stores with a full profile get more trust, and more orders.'
                  : 'Everything a shopper looks for is here. Keep it fresh.'}
              </p>
              {completeness.missing.length > 0 ? (
                <ul className="mt-4 space-y-2">
                  {completeness.missing.map((m) => (
                    <li key={m.key}>
                      <button
                        type="button"
                        onClick={() => jumpTo(m.anchor)}
                        className="flex w-full items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-left text-sm text-foreground hover:bg-accent"
                      >
                        {m.label}
                        <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <ul className="mt-4 space-y-2">
                  {completeness.items.map((m) => (
                    <li
                      key={m.key}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <CheckCircle2 className="size-4 text-emerald-600" />
                      {m.label.replace(
                        /^(Add|Describe|Say more about) /,
                        (s) => s
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="surface-card p-5 sm:p-8 lg:col-span-2">
            <UserProfileForm
              initialData={{
                fullName: userData?.full_name || '',
                username: userData?.username || '',
                email: userData?.email || '',
                phoneNumber: userData?.phone_number || '',
                country: businessData?.country || '',
                address: businessData?.business_address || '',
              }}
              resetKey={resetKey}
              onDirtyChange={setUserDirty}
              onSubmit={handleUserProfileSubmit}
              isLoading={isUpdatingUser}
            />
          </div>
          <aside className="lg:col-span-1">
            <UserProfileCard
              fullName={userData?.full_name || ''}
              registrationId={businessData?._id || ''}
              email={userData?.email || ''}
              profilePicture={userData?.profile_picture}
            />
          </aside>
        </div>
      )}
    </div>
  );
};

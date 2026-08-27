'use client';

import { cn } from '@/lib/utils';
import type { Business } from '@/redux/services/businesses/businesses.api-slice';
import { VendorImageUpload } from '../molecules/vendor-image-upload';
import {
  getVendorCover,
  getVendorInitial,
  getVendorLogo,
  getVendorName,
} from '@/lib/vendors';

interface VendorDetailHeaderProps {
  vendor?: Business;
  isLoading?: boolean;
}

// Cover banner with the vendor avatar overlapping the bottom-left.
export const VendorDetailHeader = ({
  vendor,
  isLoading,
}: VendorDetailHeaderProps) => {
  // `cover_image_url` / `business_logo_url` are what the endpoint sends. This
  // read `cover_image` and `logo`, so both images were permanently absent.
  const empty = {} as Business;
  const cover = vendor ? getVendorCover(vendor) : undefined;
  const avatar = vendor ? getVendorLogo(vendor) : undefined;
  const name = getVendorName(vendor ?? empty);

  return (
    <div className="relative">
      {/* Banner */}
      <div
        className={cn(
          'relative h-[180px] w-full overflow-hidden rounded-2xl bg-gradient-to-r from-[#cfcfcf] to-[#e9e9e9] dark:from-white/10 dark:to-white/5',
          isLoading && 'animate-pulse'
        )}
        style={
          cover
            ? {
                backgroundImage: `url(${cover})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : undefined
        }
      >
        {/* Writes cover_image_url through PATCH /admin/businesses/:id. */}
        <VendorImageUpload
          businessId={vendor?._id}
          field="cover_image_url"
          label="Change banner"
          className="absolute bottom-3 right-3"
        />
      </div>

      {/* Avatar, with the logo picker sitting on its bottom-left corner. */}
      <div className="absolute -bottom-6 left-6 size-24">
        <div className="flex size-full items-center justify-center overflow-hidden rounded-full border-4 border-white dark:border-background bg-primary/10 text-2xl font-bold text-primary shadow-md">
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatar}
              alt={name}
              className="h-full w-full object-cover"
            />
          ) : (
            getVendorInitial(vendor ?? empty)
          )}
        </div>
        <VendorImageUpload
          businessId={vendor?._id}
          field="business_logo_url"
          label="Change logo"
          iconOnly
          className="absolute bottom-0 left-0"
        />
      </div>
    </div>
  );
};

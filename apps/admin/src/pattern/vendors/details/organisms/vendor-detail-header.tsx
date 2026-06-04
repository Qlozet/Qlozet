'use client';

import { Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Business } from '@/redux/services/businesses/businesses.api-slice';
import { getVendorInitial } from '@/lib/vendors';

interface VendorDetailHeaderProps {
  vendor?: Business;
  isLoading?: boolean;
  onEditCover?: () => void;
}

// Cover banner with the vendor avatar overlapping the bottom-left.
export const VendorDetailHeader = ({
  vendor,
  isLoading,
  onEditCover,
}: VendorDetailHeaderProps) => {
  const cover =
    (vendor?.cover_image as string | undefined) ??
    (vendor?.banner as string | undefined);
  const avatar = vendor?.logo ?? vendor?.profile_picture;

  return (
    <div className="relative">
      {/* Banner */}
      <div
        className={cn(
          'relative h-[180px] w-full overflow-hidden rounded-2xl bg-gradient-to-r from-[#cfcfcf] to-[#e9e9e9]',
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
        <button
          type="button"
          aria-label="Edit cover image"
          onClick={onEditCover}
          className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-lg bg-white/80 text-gray-700 backdrop-blur hover:bg-white transition-colors cursor-pointer"
        >
          <Pencil className="size-4" />
        </button>
      </div>

      {/* Avatar */}
      <div className="absolute -bottom-6 left-6">
        <div className="flex size-24 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-primary/10 text-2xl font-bold text-primary shadow-md">
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatar as string}
              alt={getVendorInitial(vendor ?? ({} as Business))}
              className="h-full w-full object-cover"
            />
          ) : (
            getVendorInitial(vendor ?? ({} as Business))
          )}
        </div>
      </div>
    </div>
  );
};

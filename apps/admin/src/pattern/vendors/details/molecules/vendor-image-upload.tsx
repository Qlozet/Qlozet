'use client';

import { useRef, useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { readApiError } from '@/redux/services/types';
import { useUploadProfileImageMutation } from '@/redux/services/uploads/uploads.api-slice';
import { useUpdateVendorProfileMutation } from '@/redux/services/vendor-details/vendor-details.api-slice';

/** 5 MB — the cap the upload endpoint enforces. */
const MAX_BYTES = 5 * 1024 * 1024;

interface VendorImageUploadProps {
  businessId?: string;
  /** Which field on the business this writes. */
  field: 'business_logo_url' | 'cover_image_url';
  label: string;
  /** Render just the camera icon — used for the avatar badge, where the
   *  label would not fit alongside the image. */
  iconOnly?: boolean;
  className?: string;
}

/**
 * Replace a vendor's logo or cover banner.
 *
 * Two steps, both against endpoints that already existed: upload the file to
 * POST /uploads/profile, then write the returned URL to the business through
 * PATCH /admin/businesses/:id. The second is the part that was missing —
 * PATCH /business/profile only ever updates the CALLER's own business, so an
 * admin had no way to fix a vendor's imagery and the control was omitted
 * rather than left inert.
 */
export const VendorImageUpload = ({
  businessId,
  field,
  label,
  iconOnly,
  className,
}: VendorImageUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [upload] = useUploadProfileImageMutation();
  const [updateVendor] = useUpdateVendorProfileMutation();

  const handleFile = async (file?: File) => {
    if (!file || !businessId) return;

    // Checked here as well as server-side: a 5 MB round trip only to be
    // rejected is a slow way to learn the file is too big.
    if (file.size > MAX_BYTES) {
      toast.error('That image is over 5MB. Choose a smaller one.');
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('That file is not an image.');
      return;
    }

    setBusy(true);
    try {
      const uploaded = await upload(file).unwrap();
      const url = uploaded?.data?.url;
      if (!url) {
        // The upload succeeded but gave us nothing to save — writing an empty
        // string would blank the vendor's existing image.
        toast.error('The upload returned no URL. Nothing was changed.');
        return;
      }
      await updateVendor({ businessId, patch: { [field]: url } }).unwrap();
      toast.success(`${label} updated`);
    } catch (error) {
      toast.error(readApiError(error));
    } finally {
      setBusy(false);
      // Clear the input so re-picking the same file fires change again.
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => void handleFile(event.target.files?.[0])}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy || !businessId}
        aria-label={label}
        title={label}
        className={cn(
          'flex items-center justify-center bg-black/50 font-medium text-white backdrop-blur-sm transition-opacity hover:bg-black/60 disabled:opacity-50',
          iconOnly
            ? 'size-8 rounded-full border-2 border-white shadow-md dark:border-background'
            : 'gap-1.5 rounded-lg px-3 py-1.5 text-xs',
          className
        )}
      >
        {busy ? (
          <Loader2
            className={cn('animate-spin', iconOnly ? 'size-4' : 'size-3.5')}
          />
        ) : (
          <Camera className={iconOnly ? 'size-4' : 'size-3.5'} />
        )}
        {!iconOnly && (busy ? 'Uploading…' : label)}
      </button>
    </>
  );
};

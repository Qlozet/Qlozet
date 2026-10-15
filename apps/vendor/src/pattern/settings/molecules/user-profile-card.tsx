// Account card: avatar with a change button, name and sign-in email.
// Profile picture uploads to Cloudinary, then PATCH /users/me/profile.

import React, { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Camera, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useUploadProfileImageMutation } from '@/redux/services/uploads/uploads.api-slice';
import { useUpdateUserProfileMutation } from '@/redux/services/settings/settings.api-slice';
import { toast } from 'sonner';
import { readApiError } from '@/redux/services/types';

interface UserProfileCardProps {
  fullName: string;
  /** Kept for callers; no longer shown - an object id means nothing to a person. */
  registrationId?: string;
  email: string;
  avatarUrl?: string;
  profilePicture?: string;
  /** Role at the active store, e.g. "Owner". */
  role?: string;
  className?: string;
}

export const UserProfileCard: React.FC<UserProfileCardProps> = ({
  fullName,
  email,
  avatarUrl,
  profilePicture,
  role,
  className,
}) => {
  const imageUrl = avatarUrl || profilePicture;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localPicture, setLocalPicture] = useState<string | null>(null);

  const [uploadImage, { isLoading: isUploading }] =
    useUploadProfileImageMutation();
  const [updateUser] = useUpdateUserProfileMutation();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await uploadImage(file).unwrap();
      const uploadedUrl = result?.data?.url || (result as any)?.url;
      if (!uploadedUrl) {
        toast.error('Upload failed - no URL returned');
        return;
      }
      await updateUser({ profile_picture: uploadedUrl }).unwrap();
      setLocalPicture(uploadedUrl);
      toast.success('Profile photo updated');
    } catch (error: any) {
      toast.error(readApiError(error, 'Could not upload the photo'));
    }
    e.target.value = '';
  };

  const displayPicture = localPicture || imageUrl;

  return (
    <div className={cn('surface-card px-6 py-8', className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
      <div className="flex flex-col items-center text-center">
        <div className="relative">
          <div className="flex size-28 items-center justify-center overflow-hidden rounded-full border-4 border-card bg-muted shadow-md">
            {displayPicture ? (
              <Image
                src={displayPicture}
                alt={fullName}
                width={112}
                height={112}
                className="size-full object-cover"
                unoptimized={displayPicture?.includes('/raw/')}
              />
            ) : (
              <span className="text-4xl font-bold text-muted-foreground">
                {fullName.charAt(0) || 'U'}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            aria-label="Change profile photo"
            className="absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-card bg-primary p-2 text-primary-foreground shadow-md hover:opacity-90 disabled:opacity-60"
          >
            {isUploading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Camera className="size-4" />
            )}
          </button>
        </div>
        <h3 className="mt-4 text-lg font-semibold text-foreground">
          {fullName || 'Your account'}
        </h3>
        <p className="mt-1 break-all text-sm text-muted-foreground">{email}</p>
        {role && (
          <span className="mt-2 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold capitalize text-primary">
            {role}
          </span>
        )}
        <p className="mt-4 text-xs text-muted-foreground">
          Your photo shows on team lists and in order chats with customers.
        </p>
      </div>
    </div>
  );
};

// User Profile Card - Molecule
// Card showing user profile information with avatar
// Profile picture uploads to Cloudinary, shown via local state

import React, { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Camera, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useUploadProfileImageMutation } from '@/redux/services/uploads/uploads.api-slice';
import { useUpdateUserProfileMutation } from '@/redux/services/settings/settings.api-slice';
import { toast } from 'sonner';

interface UserProfileCardProps {
  fullName: string;
  registrationId: string;
  email: string;
  avatarUrl?: string;
  profilePicture?: string;
  className?: string;
}

export const UserProfileCard: React.FC<UserProfileCardProps> = ({
  fullName,
  registrationId,
  email,
  avatarUrl,
  profilePicture,
  className,
}) => {
  const imageUrl = avatarUrl || profilePicture;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localPicture, setLocalPicture] = useState<string | null>(null);

  const [uploadImage, { isLoading: isUploading }] = useUploadProfileImageMutation();
  const [updateUser] = useUpdateUserProfileMutation();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await uploadImage(file).unwrap();
      const uploadedUrl = result?.data?.url || (result as any)?.url;

      if (!uploadedUrl) {
        toast.error('Upload failed — no URL returned');
        return;
      }

      // Save URL to user profile via PATCH /users/me/profile
      await updateUser({ profile_picture: uploadedUrl }).unwrap();
      setLocalPicture(uploadedUrl);
      toast.success('Profile picture updated!');
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to upload profile picture');
    }

    e.target.value = '';
  };

  const displayPicture = localPicture || imageUrl;

  return (
    <div className={cn('bg-white rounded-lg p-6 shadow-sm', className)}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type='file'
        accept='image/png,image/jpeg,image/webp'
        className='hidden'
        onChange={handleFileChange}
      />

      {/* Avatar Section */}
      <div className='flex flex-col items-center'>
        <div className='relative'>
          <div className='w-32 h-32 bg-white rounded-full border-4 border-gray-100 shadow-lg flex items-center justify-center overflow-hidden'>
            {displayPicture ? (
              <Image
                src={displayPicture}
                alt={fullName}
                width={128}
                height={128}
                className='object-cover'
              />
            ) : (
              <div className='w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center'>
                <span className='text-4xl font-bold text-gray-600'>
                  {fullName.charAt(0) || 'U'}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className='absolute bottom-0 right-0 bg-white p-2.5 rounded-full shadow-md border-2 border-gray-100 hover:bg-gray-50 disabled:opacity-50'
          >
            {isUploading ? (
              <Loader2 className='w-5 h-5 text-gray-700 animate-spin' />
            ) : (
              <Camera className='w-5 h-5 text-gray-700' />
            )}
          </button>
        </div>

        {/* User Info */}
        <h3 className='text-xl font-semibold text-gray-900 mt-6'>
          {fullName || 'User'}
        </h3>
        <p className='text-sm text-gray-600 mt-2'>{registrationId}</p>
        <p className='text-sm text-gray-600 mt-1'>{email}</p>
      </div>
    </div>
  );
};

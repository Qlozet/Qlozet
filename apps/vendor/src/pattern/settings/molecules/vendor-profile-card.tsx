// Vendor Profile Card - Molecule
// Card showing vendor profile information and document upload options
// Uploads go to Cloudinary via POST /uploads/profile, then URL is saved to Business via PATCH /business/profile

import React, { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Camera, Upload, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useUploadProfileImageMutation } from '@/redux/services/uploads/uploads.api-slice';
import { useUpdateBusinessProfileDetailsMutation } from '@/redux/services/settings/settings.api-slice';
import { toast } from 'sonner';

interface VendorProfileCardProps {
  vendorName: string;
  registrationId: string;
  website: string;
  status: 'pending' | 'approved' | 'rejected';
  logoUrl?: string;
  coverImageUrl?: string;
  className?: string;
}

export const VendorProfileCard: React.FC<VendorProfileCardProps> = ({
  vendorName,
  registrationId,
  website,
  status,
  logoUrl,
  coverImageUrl,
  className,
}) => {
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const cacInputRef = useRef<HTMLInputElement>(null);

  // Local state for uploaded images (shown immediately after upload)
  const [localLogo, setLocalLogo] = useState<string | null>(null);
  const [localCover, setLocalCover] = useState<string | null>(null);

  const [uploadImage, { isLoading: isUploading }] = useUploadProfileImageMutation();
  const [updateBusinessDetails] = useUpdateBusinessProfileDetailsMutation();

  const handleImageUpload = async (
    file: File,
    type: 'logo' | 'cover' | 'cac'
  ) => {
    try {
      const result = await uploadImage(file).unwrap();
      const imageUrl = result?.data?.url || (result as any)?.url;

      if (!imageUrl) {
        toast.error('Upload failed — no URL returned');
        return;
      }

      const payloadKey = type === 'logo' ? 'business_logo_url' : type === 'cover' ? 'cover_image_url' : 'cac_document_url';
      
      // Save URL to business profile
      await updateBusinessDetails({ [payloadKey]: type === 'cac' ? [imageUrl] : imageUrl } as any).unwrap();

      // Update local state to show the image immediately
      if (type === 'logo') {
        setLocalLogo(imageUrl);
        toast.success('Logo uploaded successfully!');
      } else if (type === 'cover') {
        setLocalCover(imageUrl);
        toast.success('Cover image uploaded successfully!');
      } else {
        toast.success('CAC document uploaded successfully!');
      }
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to upload image');
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'logo' | 'cover' | 'cac'
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file, type);
    }
    e.target.value = '';
  };

  const displayLogo = localLogo || logoUrl;
  const displayCover = localCover || coverImageUrl;

  const getStatusColor = () => {
    switch (status) {
      case 'approved':
        return 'text-green-600';
      case 'rejected':
        return 'text-red-600';
      case 'pending':
      default:
        return 'text-[#D4A574]';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'pending':
      default:
        return 'Pending approval';
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Main Vendor Card */}
      <div className='bg-white dark:bg-card dark:border dark:border-white/10 rounded-[12px] custom-card-shadow overflow-hidden pb-6'>
      {/* Hidden file inputs */}
      <input
        ref={logoInputRef}
        type='file'
        accept='image/png,image/svg+xml,image/jpeg,image/webp'
        className='hidden'
        onChange={(e) => handleFileChange(e, 'logo')}
      />
      <input
        ref={coverInputRef}
        type='file'
        accept='image/png,image/jpeg,image/webp'
        className='hidden'
        onChange={(e) => handleFileChange(e, 'cover')}
      />
      <input
        ref={cacInputRef}
        type='file'
        accept='image/png,image/jpeg,application/pdf'
        className='hidden'
        onChange={(e) => handleFileChange(e, 'cac')}
      />

      {/* Cover Image Section (Touches edges) */}
      <div className='relative h-32 bg-gradient-to-br from-gray-100 to-gray-200'>
        {displayCover ? (
          <Image
            src={displayCover}
            alt='Cover'
            fill
            className='object-cover'
            unoptimized={displayCover?.includes('/raw/')}
          />
        ) : (
          <div className='absolute inset-0 flex items-center justify-center'>
            <div className='w-full h-full bg-gradient-to-br from-orange-100 via-purple-100 to-blue-100' />
          </div>
        )}
        <button
          onClick={() => coverInputRef.current?.click()}
          disabled={isUploading}
          className='absolute top-2 right-2 bg-white dark:bg-muted p-2 rounded-full shadow-md hover:bg-gray-50 dark:hover:bg-muted/80'
        >
          {isUploading ? (
            <Loader2 className='w-4 h-4 text-gray-600 animate-spin' />
          ) : (
            <Camera className='w-4 h-4 text-gray-600' />
          )}
        </button>
      </div>

      {/* Logo Section */}
      <div className='px-6 flex flex-col items-center -mt-16'>
        <div className='relative'>
          <div className='w-24 h-24 bg-white dark:bg-muted rounded-full border-4 border-white dark:border-card shadow-lg flex items-center justify-center overflow-hidden'>
            {displayLogo ? (
              <Image
                src={displayLogo}
                alt={vendorName}
                width={96}
                height={96}
                className='object-cover'
                unoptimized={displayLogo?.includes('/raw/')}
              />
            ) : (
              <div className='w-full h-full bg-white flex items-center justify-center'>
                <span className='text-3xl font-bold text-gray-800'>
                  {vendorName.charAt(0)}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={() => logoInputRef.current?.click()}
            disabled={isUploading}
            className='absolute bottom-0 right-0 bg-[#3d2817] p-2 rounded-full shadow-md border-2 border-white hover:bg-[#2c1d11]'
          >
            {isUploading ? (
              <Loader2 className='w-4 h-4 text-gray-600 animate-spin' />
            ) : (
              <Camera className='w-4 h-4 text-white' />
            )}
          </button>
        </div>

        {/* Vendor Info */}
        <h3 className='text-lg font-semibold text-[#1C1C1E] mt-4'>
          {vendorName}
        </h3>
        <p className='text-sm text-gray-400 mt-1 uppercase tracking-wider'>{registrationId}</p>
        <p className='text-sm text-[#5C2D0D] mt-1'>{website}</p>
        <p className={cn('text-xs font-semibold mt-1', getStatusColor())}>
          {getStatusText()}
        </p>
      </div>
      </div>

      {/* Upload Buttons - Separated */}
      <div className='space-y-4'>
        <button
          onClick={() => logoInputRef.current?.click()}
          disabled={isUploading}
          className='w-full flex items-center gap-3 px-6 py-4 bg-white rounded-[12px] custom-card-shadow transition-colors hover:bg-gray-50 disabled:opacity-50'
        >
          <Upload className='w-5 h-5 text-gray-400' />
          <span className='text-sm font-medium text-gray-600'>Upload SVG/PNG logo</span>
        </button>

        <button
          onClick={() => coverInputRef.current?.click()}
          disabled={isUploading}
          className='w-full flex items-center gap-3 px-6 py-4 bg-white rounded-[12px] custom-card-shadow transition-colors hover:bg-gray-50 disabled:opacity-50'
        >
          <Upload className='w-5 h-5 text-gray-400' />
          <span className='text-sm font-medium text-gray-600'>Upload Cover image</span>
        </button>

        <button
          onClick={() => cacInputRef.current?.click()}
          disabled={isUploading}
          className='w-full flex items-center gap-3 px-6 py-4 bg-white rounded-[12px] custom-card-shadow transition-colors hover:bg-gray-50 disabled:opacity-50'
        >
          <Upload className='w-5 h-5 text-gray-400' />
          <span className='text-sm font-medium text-gray-600'>Upload CAC Document</span>
        </button>
      </div>
    </div>
  );
};

// Vendor Profile Card - Molecule
// Card showing vendor profile information and document upload options

import React from 'react';
import { cn } from '@/lib/utils';
import { Camera, Upload } from 'lucide-react';
import Image from 'next/image';

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
    <div className={cn('bg-white rounded-lg p-6 shadow-sm', className)}>
      {/* Cover Image Section */}
      <div className='relative h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-4 overflow-hidden'>
        {coverImageUrl ? (
          <Image
            src={coverImageUrl}
            alt='Cover'
            fill
            className='object-cover'
          />
        ) : (
          <div className='absolute inset-0 flex items-center justify-center'>
            <div className='w-full h-full bg-gradient-to-br from-orange-100 via-purple-100 to-blue-100' />
          </div>
        )}
        <button className='absolute top-2 right-2 bg-white p-2 rounded-full shadow-md hover:bg-gray-50'>
          <Camera className='w-4 h-4 text-gray-600' />
        </button>
      </div>

      {/* Logo Section */}
      <div className='flex flex-col items-center -mt-16 mb-4'>
        <div className='relative'>
          <div className='w-24 h-24 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center overflow-hidden'>
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={vendorName}
                width={96}
                height={96}
                className='object-cover'
              />
            ) : (
              <div className='w-full h-full bg-white flex items-center justify-center'>
                <span className='text-3xl font-bold text-gray-800'>
                  {vendorName.charAt(0)}
                </span>
              </div>
            )}
          </div>
          <button className='absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md border border-gray-200 hover:bg-gray-50'>
            <Camera className='w-4 h-4 text-gray-600' />
          </button>
        </div>

        {/* Vendor Info */}
        <h3 className='text-lg font-semibold text-gray-900 mt-4'>
          {vendorName}
        </h3>
        <p className='text-sm text-gray-600 mt-1'>{registrationId}</p>
        <p className='text-sm text-[#5C2D0D] mt-1'>{website}</p>
        <p className={cn('text-sm font-medium mt-2', getStatusColor())}>
          {getStatusText()}
        </p>
      </div>

      {/* Upload Buttons */}
      <div className='space-y-3 mt-6'>
        <button className='w-full flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors'>
          <Upload className='w-5 h-5 text-gray-600' />
          <span className='text-sm text-gray-700'>Upload SVG/PNG logo</span>
        </button>

        <button className='w-full flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors'>
          <Upload className='w-5 h-5 text-gray-600' />
          <span className='text-sm text-gray-700'>Upload Cover image</span>
        </button>

        <button className='w-full flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors'>
          <Upload className='w-5 h-5 text-gray-600' />
          <span className='text-sm text-gray-700'>Upload CAC Document</span>
        </button>
      </div>
    </div>
  );
};

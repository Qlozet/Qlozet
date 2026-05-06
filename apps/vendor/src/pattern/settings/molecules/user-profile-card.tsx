// User Profile Card - Molecule
// Card showing user profile information with avatar

import React from 'react';
import { cn } from '@/lib/utils';
import { Camera } from 'lucide-react';
import Image from 'next/image';

interface UserProfileCardProps {
  fullName: string;
  registrationId: string;
  email: string;
  avatarUrl?: string;
  className?: string;
}

export const UserProfileCard: React.FC<UserProfileCardProps> = ({
  fullName,
  registrationId,
  email,
  avatarUrl,
  className,
}) => {
  return (
    <div className={cn('bg-white rounded-lg p-6 shadow-sm', className)}>
      {/* Avatar Section */}
      <div className='flex flex-col items-center'>
        <div className='relative'>
          <div className='w-32 h-32 bg-white rounded-full border-4 border-gray-100 shadow-lg flex items-center justify-center overflow-hidden'>
            {avatarUrl ? (
              <Image
                src={avatarUrl}
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
          <button className='absolute bottom-0 right-0 bg-white p-2.5 rounded-full shadow-md border-2 border-gray-100 hover:bg-gray-50'>
            <Camera className='w-5 h-5 text-gray-700' />
          </button>
        </div>

        {/* User Info */}
        <h3 className='text-xl font-semibold text-gray-900 mt-6'>
          {fullName || 'John Doe'}
        </h3>
        <p className='text-sm text-gray-600 mt-2'>{registrationId}</p>
        <p className='text-sm text-gray-600 mt-1'>{email}</p>
      </div>
    </div>
  );
};

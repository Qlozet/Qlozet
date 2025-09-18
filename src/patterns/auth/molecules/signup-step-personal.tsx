'use client';

import React from 'react';
import { Control } from 'react-hook-form';
import { AuthInput } from '../atoms/auth-input';
import { cn } from '@/lib/utils';

export interface PersonalInfoData {
  personalName: string;
  phoneName: string;
  nationalIdentityNumber: string;
  bankVerificationNumber: string;
}

interface SignupStepPersonalProps {
  control: Control<any>;
  className?: string;
}

export const SignupStepPersonal: React.FC<SignupStepPersonalProps> = ({
  control,
  className = '',
}) => {
  return (
    <div className={cn('space-y-6', className)}>
      <div className='text-center mb-8'>
        <h2 className='text-2xl font-bold text-primary mb-2'>
          Personal Information
        </h2>
        <p className='text-muted-foreground'>Tell us about yourself</p>
      </div>

      <AuthInput
        control={control}
        name='personalName'
        label='Full Name'
        placeholder='Enter your full name'
        description='Your legal name as it appears on official documents'
      />

      <AuthInput
        control={control}
        name='phoneName'
        label='Personal Phone Number'
        type='tel'
        placeholder='+1 (555) 000-0000'
        description='Your personal contact number'
      />

      <AuthInput
        control={control}
        name='nationalIdentityNumber'
        label='National Identity Number (NIN)'
        placeholder='Enter your NIN'
        description='Your National Identity Number for verification'
      />

      <AuthInput
        control={control}
        name='bankVerificationNumber'
        label='Bank Verification Number (BVN)'
        placeholder='Enter your BVN'
        description='Your Bank Verification Number for financial verification'
      />
    </div>
  );
};

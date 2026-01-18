'use client';

import React from 'react';
import { Control } from 'react-hook-form';
import { AuthInput } from '../atoms/auth-input';
import { cn } from '@/lib/utils';

export interface PersonalInfoData {
  personalName: string;
  personalEmail: string;
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
        <p className='text-muted-foreground'>Fill out personal information</p>
      </div>

      {/* Personal Name */}
      <AuthInput
        control={control}
        name='personalName'
        label='Full Name'
        placeholder='Enter your full name'
      />

      {/* Personal Email */}
      <AuthInput
        control={control}
        name='personalEmail'
        label='Personal Email'
        placeholder='johnDoe@company.com'
      />

      {/* Personal Phone number */}
      <AuthInput
        control={control}
        name='phoneName'
        label='Personal Phone Number'
        type='tel'
        placeholder='+1 (555) 000-0000'
      />

      {/* National Identity Number */}
      <AuthInput
        control={control}
        name='nationalIdentityNumber'
        label='National Identity Number (NIN)'
        placeholder='Enter your NIN'
      />

      {/* Bank Verification Number */}
      {/* <AuthInput
        control={control}
        name='bankVerificationNumber'
        label='Bank Verification Number (BVN)'
        placeholder='Enter your BVN'
        description='Your Bank Verification Number for financial verification'
      /> */}
    </div>
  );
};

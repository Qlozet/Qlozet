'use client';

import React from 'react';
import { Control } from 'react-hook-form';
import { AuthInput } from '../atoms/auth-input';
import { cn } from '@/lib/utils';

export interface BusinessInfoData {
  businessName: string;
  businessEmail: string;
  businessPhoneNumber: string;
  businessAddress: string;
}

interface SignupStepBusinessProps {
  control: Control<any>;
  className?: string;
}

export const SignupStepBusiness: React.FC<SignupStepBusinessProps> = ({
  control,
  className = '',
}) => {
  return (
    <div className={cn('space-y-6', className)}>
      <div className='text-center mb-8'>
        <h2 className='text-2xl font-bold text-primary mb-2'>
          Business Information
        </h2>
        <p className='text-muted-foreground'>Tell us about your business</p>
      </div>

      {/* Business Name */}
      <AuthInput
        control={control}
        name='businessName'
        label='Business Name'
        placeholder='Enter your business name'
      />

      {/* Business Email */}
      <AuthInput
        control={control}
        name='businessEmail'
        label='Business Email'
        placeholder='business@company.com'
      />

      {/* Business Phone number */}
      <AuthInput
        control={control}
        name='businessPhoneNumber'
        label='Business Phone Number'
        type='tel'
        placeholder='+1 (555) 000-0000'
      />

      {/* Business Address */}
      <AuthInput
        control={control}
        name='businessAddress'
        label='Business Address'
        placeholder='Enter your business address'
      />
    </div>
  );
};

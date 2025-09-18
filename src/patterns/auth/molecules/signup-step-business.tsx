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

      <AuthInput
        control={control}
        name='businessName'
        label='Business Name'
        placeholder='Enter your business name'
        description='The legal name of your business'
      />

      <AuthInput
        control={control}
        name='businessEmail'
        label='Business Email'
        type='email'
        placeholder='business@company.com'
        description='Official email address for your business'
      />

      <AuthInput
        control={control}
        name='businessPhoneNumber'
        label='Business Phone Number'
        type='tel'
        placeholder='+1 (555) 000-0000'
        description='Phone number for business inquiries'
      />

      <AuthInput
        control={control}
        name='businessAddress'
        label='Business Address'
        placeholder='Enter your business address'
        description='Physical address of your business'
      />
    </div>
  );
};

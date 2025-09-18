'use client';

import React from 'react';
import { Control } from 'react-hook-form';
import { PasswordInput } from '../atoms/password-input';
import { cn } from '@/lib/utils';

export interface PasswordInfoData {
  password: string;
  confirmPassword: string;
}

interface SignupStepPasswordProps {
  control: Control<any>;
  className?: string;
}

export const SignupStepPassword: React.FC<SignupStepPasswordProps> = ({
  control,
  className = '',
}) => {
  return (
    <div className={cn('space-y-6', className)}>
      <div className='text-center mb-8'>
        <h2 className='text-2xl font-bold text-primary mb-2'>
          Create Password
        </h2>
        <p className='text-muted-foreground'>
          Choose a strong password for your account
        </p>
      </div>

      <PasswordInput
        control={control}
        name='password'
        label='Password'
        placeholder='Create a strong password'
        description='Password must be at least 8 characters with uppercase, lowercase, and number'
        showStrengthIndicator
      />

      <PasswordInput
        control={control}
        name='confirmPassword'
        label='Confirm Password'
        placeholder='Confirm your password'
        description='Re-enter your password to confirm'
      />
    </div>
  );
};

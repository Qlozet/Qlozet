'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AuthFormCard } from '../molecules/auth-form-card';
import {
  ForgotPasswordForm
} from '../molecules/forgot-password-form';

export const ForgotPasswordTemplate = () => {

  return (
    <AuthFormCard
      title='Forgot Password'
      subtitle='Enter your email address to receive a password reset link'
      showLogo={true}
    >
      <ForgotPasswordForm />
    </AuthFormCard>
  );
};

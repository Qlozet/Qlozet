'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AUTH_ROUTES } from '@/lib/routes';
import { AuthFormCard } from '../molecules/auth-form-card';

/**
 * Since OTP verification is now handled inline in the signup wizard,
 * this page redirects back to the signup flow.
 */
const AwaitingVerificationTemplate = () => {
  const { push } = useRouter();

  useEffect(() => {
    push(AUTH_ROUTES.signup);
  }, [push]);

  return (
    <AuthFormCard
      title='Redirecting...'
      subtitle='Taking you back to complete your verification'
      showLogo={true}
    >
      <div className='flex justify-center py-8'>
        <div className='size-6 animate-spin rounded-full border-2 border-primary border-t-transparent' />
      </div>
    </AuthFormCard>
  );
};

export default AwaitingVerificationTemplate;
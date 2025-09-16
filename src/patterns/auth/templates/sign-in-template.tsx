"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '../organisms/auth-layout';
import { SignInSection } from '../organisms/sign-in-section';
import { getToken } from '@/utils/localstorage';

interface SignInTemplateProps {
  className?: string;
}

export const SignInTemplate: React.FC<SignInTemplateProps> = ({
  className = '',
}) => {
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (token) {
      try {
        const userExist = JSON.parse(token);
        if (userExist.token) {
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    }
  }, [router]);

  return (
    <AuthLayout
      title="Sign In"
      subtitle="Please enter your login details below"
      className={className}
    >
      <SignInSection />
    </AuthLayout>
  );
};
"use client";

import React from 'react';
import { SignInForm, SignInFormData } from '../molecules/sign-in-form';
import { useSignInMutation } from '@/redux/services/auth/auth.api-slice';
import { useRouter } from 'next/navigation';
import { setToken } from '@/utils/localstorage';
import toast from 'react-hot-toast';
import Toast from '@/components/ToastComponent/toast';

interface SignInSectionProps {
  className?: string;
}

export const SignInSection: React.FC<SignInSectionProps> = ({
  className = '',
}) => {
  const router = useRouter();
  const [signIn, { isLoading }] = useSignInMutation();

  const handleSignIn = async (data: SignInFormData) => {
    try {
      const response = await signIn({
        email: data.businessEmail,
        password: data.password,
      }).unwrap();

      // Store token and redirect
      setToken(JSON.stringify(response.data));
      router.push('/dashboard');
      toast(<Toast text="Sign in successful!" type="success" />);
    } catch (error: any) {
      const errorMessage = error?.data?.message || 'Sign in failed. Please try again.';
      toast(<Toast text={errorMessage} type="danger" />);
    }
  };

  return (
    <div className={className}>
      <SignInForm 
        onSubmit={handleSignIn}
        loading={isLoading}
      />
    </div>
  );
};
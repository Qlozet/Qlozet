'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '../organisms/auth-layout';
import {
  ForgotPasswordForm,
  ForgotPasswordFormData,
} from '../molecules/forgot-password-form';
import { useForgotPasswordMutation } from '@/redux/services/auth/auth.api-slice';
import toast from 'react-hot-toast';
import Toast from '@/components/ToastComponent/toast';

interface ForgotPasswordTemplateProps {
  className?: string;
}

export const ForgotPasswordTemplate: React.FC<ForgotPasswordTemplateProps> = ({
  className = '',
}) => {
  const router = useRouter();
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const handleForgotPassword = async (data: ForgotPasswordFormData) => {
    try {
      const response = await forgotPassword({
        businessEmail: data.businessEmail,
      }).unwrap();

      toast(<Toast text={response.message} type='success' />);
      router.push('/auth/create-new-password');
    } catch (error: any) {
      const errorMessage =
        error?.data?.message || 'Failed to send reset link. Please try again.';
      toast(<Toast text={errorMessage} type='danger' />);
    }
  };

  return (
    <AuthLayout
      title='Forgot Password'
      subtitle='Enter your email address to receive a password reset link'
      className={className}
    >
      <ForgotPasswordForm onSubmit={handleForgotPassword} loading={isLoading} />
    </AuthLayout>
  );
};

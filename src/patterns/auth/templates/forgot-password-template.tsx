'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '../organisms/auth-layout';
import {
  ForgotPasswordForm,
  ForgotPasswordFormData,
} from '../molecules/forgot-password-form';
import { useForgotPasswordMutation } from '@/redux/services/auth/auth.api-slice';
import { toast } from 'sonner';

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

      toast.success(response.message);
      router.push('/auth/create-new-password');
    } catch (error: any) {
      const errorMessage =
        error?.data?.message || 'Failed to send reset link. Please try again.';
      toast.error(errorMessage);
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

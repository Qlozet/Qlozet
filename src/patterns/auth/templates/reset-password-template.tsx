'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthLayout } from '../organisms/auth-layout';
import {
  ResetPasswordForm,
  ResetPasswordFormData,
} from '../molecules/reset-password-form';
import { useResetPasswordMutation } from '@/redux/services/auth/auth.api-slice';
import { toast } from 'sonner';

interface ResetPasswordTemplateProps {
  className?: string;
}

export const ResetPasswordTemplate: React.FC<ResetPasswordTemplateProps> = ({
  className = '',
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const handleResetPassword = async (data: ResetPasswordFormData) => {
    if (!token) {
      toast.error('Invalid reset token. Please request a new password reset.');
      return;
    }

    try {
      const response = await resetPassword({
        token,
        password: data.password,
        confirmPassword: data.confirmPassword,
      }).unwrap();

      toast.success(response.message || 'Password reset successfully!');
      router.push('/auth/sign-in');
    } catch (error: any) {
      const errorMessage =
        error?.data?.message || 'Failed to reset password. Please try again.';
      toast.error(errorMessage);
    }
  };

  return (
    <AuthLayout
      title='Reset Password'
      subtitle='Enter your new password below'
      className={className}
      showImage={false}
    >
      <ResetPasswordForm onSubmit={handleResetPassword} loading={isLoading} />
    </AuthLayout>
  );
};

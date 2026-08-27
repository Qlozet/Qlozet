'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ResetPasswordForm,
  ResetPasswordFormData,
} from '../molecules/reset-password-form';
import { useResetPasswordMutation } from '@/redux/services/auth/auth.api-slice';
import { toast } from 'sonner';
import { AUTH_ROUTES } from '@/lib/routes';
import { AuthFormCard } from '../molecules/auth-form-card';
import { readApiError } from '@/redux/services/types';

export const ResetPasswordTemplate = () => {
  const { push } = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const code = searchParams.get('code');
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  // Reached without a verified email + code (e.g. deep link / refresh) — send
  // them back to the start rather than showing a form that can't submit.
  useEffect(() => {
    if (!email || !code) {
      toast.error('Your reset session expired. Please request a new code.');
      push(AUTH_ROUTES.forgotPassword);
    }
  }, [email, code, push]);

  const handleResetPassword = async (data: ResetPasswordFormData) => {
    if (!email || !code) {
      toast.error('Your reset session expired. Please request a new code.');
      push(AUTH_ROUTES.forgotPassword);
      return;
    }

    resetPassword({
      email,
      code,
      password: data.password,
      confirmPassword: data.confirmPassword,
    })
      .unwrap()
      .then((response) => {
        toast.success(response.message || 'Password reset successfully!');
        push(AUTH_ROUTES.signIn);
      })
      .catch((error) => {
        const errorMessage = readApiError(
          error,
          'Failed to reset password. Please try again.'
        );
        toast.error(errorMessage);
      });
  };

  return (
    <AuthFormCard
      title="Create a new password"
      subtitle="Enter your new password below"
      showLogo={true}
      className="w-full md:min-w-[344px]"
    >
      <ResetPasswordForm onSubmit={handleResetPassword} loading={isLoading} />
    </AuthFormCard>
  );
};

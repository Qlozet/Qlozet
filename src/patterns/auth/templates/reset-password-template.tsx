'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import {
  ResetPasswordForm,
  ResetPasswordFormData,
} from '../molecules/reset-password-form';
import { useResetPasswordMutation } from '@/redux/services/auth/auth.api-slice';
import { toast } from 'sonner';
import { AUTH_ROUTES } from '@/lib/routes';
import { AuthFormCard } from '../molecules/auth-form-card';

export const ResetPasswordTemplate = () => {
  const { push } = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const handleResetPassword = async (data: ResetPasswordFormData) => {
    if (!token) {
      toast.error('Invalid reset token. Please request a new password reset.');
      return;
    }

    resetPassword({
      token,
      password: data.password,
      confirmPassword: data.confirmPassword,
    })
      .unwrap()
      .then((response) => {
        toast.success(response.message || 'Password reset successfully!');
        push(AUTH_ROUTES.signIn);
      })
      .catch((error) => {
        const errorMessage =
          error?.data?.message || 'Failed to reset password. Please try again.';
        toast.error(errorMessage);
      })
  };

  return (
    <AuthFormCard
      title='Reset Password'
      subtitle='Enter your new password below'
      showLogo={true}
      className='w-full md:min-w-[344px]'
    >
      <ResetPasswordForm onSubmit={handleResetPassword} loading={isLoading} />
    </AuthFormCard>
  );
};

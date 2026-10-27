'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ResetPasswordForm,
  ResetPasswordFormData,
} from '../molecules/reset-password-form';
import {
  useChangePasswordMutation,
  useResetPasswordMutation,
} from '@/redux/services/auth/auth.api-slice';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import {
  clearMustChangePassword,
  selectMustChangePassword,
} from '@/redux/slices/auth-slice';
import { APP_ROUTES } from '@/lib/routes';
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
  const [changePassword, { isLoading: isChanging }] =
    useChangePasswordMutation();
  const dispatch = useAppDispatch();
  // A team member signed in with the temporary password from their invite:
  // they set their own here, with no reset code involved.
  const mustChange = useAppSelector(selectMustChangePassword);
  const setOwn = mustChange && (!email || !code);

  // Reached without a verified email + code (e.g. deep link / refresh) — send
  // them back to the start rather than showing a form that can't submit.
  useEffect(() => {
    if (!setOwn && (!email || !code)) {
      toast.error('Your reset session expired. Please request a new code.');
      push(AUTH_ROUTES.forgotPassword);
    }
  }, [email, code, push, setOwn]);

  const handleSetOwnPassword = async (data: ResetPasswordFormData) => {
    changePassword({
      currentPassword: data.currentPassword ?? '',
      newPassword: data.password,
      confirmPassword: data.confirmPassword,
    })
      .unwrap()
      .then(() => {
        dispatch(clearMustChangePassword());
        toast.success('Password set. Welcome aboard.');
        push(APP_ROUTES.dashboard);
      })
      .catch((error) => {
        toast.error(
          readApiError(error, "Couldn't set your password. Please try again.")
        );
      });
  };

  if (setOwn) {
    return (
      <AuthFormCard
        title="Set your password"
        subtitle="Enter the temporary password from your invite email, then choose your own."
        showLogo={true}
        className="w-full md:min-w-[344px]"
      >
        <ResetPasswordForm
          withCurrent
          submitLabel="Set Password"
          onSubmit={handleSetOwnPassword}
          loading={isChanging}
        />
      </AuthFormCard>
    );
  }

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

'use client';

import { useEffect, useState } from 'react';
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
  selectActiveBusiness,
  selectBusinesses,
  selectMustChangePassword,
} from '@/redux/slices/auth-slice';
import { BusinessPicker } from '../organisms/business-picker';
import { useSwitchStore } from '@/lib/hooks/use-switch-store';
import { resetAccessLossGuard } from '@/lib/session/access-loss';
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
  const businesses = useAppSelector(selectBusinesses);
  const activeBusiness = useAppSelector(selectActiveBusiness);
  const { switchStore, switchingId } = useSwitchStore();
  // Set once their own password is saved: the flag above clears then, and
  // this keeps the page on the set-password flow (and off the "reset session
  // expired" redirect) while they pick a store or move on.
  const [passwordSet, setPasswordSet] = useState(false);
  const [showStorePicker, setShowStorePicker] = useState(false);
  const setOwn = (mustChange || passwordSet) && (!email || !code);

  // Reached without a verified email + code (e.g. deep link / refresh) — send
  // them back to the start rather than showing a form that can't submit.
  useEffect(() => {
    if (!setOwn && (!email || !code)) {
      toast.error('Your reset session expired. Please request a new code.');
      push(AUTH_ROUTES.forgotPassword);
    }
  }, [email, code, push, setOwn]);

  // A member of several stores chooses which one to open, as at sign-in.
  const handleSelectStore = async (businessId: string) => {
    if (businessId !== activeBusiness?._id) {
      const switched = await switchStore(businessId);
      if (!switched) return;
    }
    push(APP_ROUTES.dashboard);
  };

  const handleSetOwnPassword = async (data: ResetPasswordFormData) => {
    changePassword({
      currentPassword: data.currentPassword ?? '',
      newPassword: data.password,
      confirmPassword: data.confirmPassword,
    })
      .unwrap()
      .then(() => {
        setPasswordSet(true);
        dispatch(clearMustChangePassword());
        // The store routes open up again now.
        resetAccessLossGuard();
        toast.success('Password set. Welcome aboard.');
        if ((businesses?.length ?? 0) > 1) {
          setShowStorePicker(true);
          return;
        }
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
      <>
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
            loading={isChanging || passwordSet}
          />
        </AuthFormCard>
        {showStorePicker && (
          <BusinessPicker
            businesses={businesses}
            onSelect={handleSelectStore}
            isLoading={!!switchingId}
            loadingId={switchingId}
            activeId={activeBusiness?._id}
          />
        )}
      </>
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

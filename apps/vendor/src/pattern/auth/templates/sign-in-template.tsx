'use client';

import React, { useState } from 'react';
import { AuthLayout } from '../organisms/auth-layout';
import {
  useSignInMutation,
  type LoginResponseBusiness,
} from '@/redux/services/auth/auth.api-slice';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { APP_ROUTES, AUTH_ROUTES } from '@/lib/routes';
import { PAGES_IN_PROGRESS } from '@/lib/feature-flags';
import { Form } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SignInFormData, signInSchema } from '@/lib/validations/auth';
import { AuthInput } from '../atoms/auth-input';
import { PasswordInput } from '../atoms/password-input';
import { AuthLink } from '../atoms/auth-link';
import arrowRight from '@/public/assets/svg/arrow-right.svg';
import { SubmitButton } from '@/pattern/common/molecules/submit-button';
import { useAppDispatch } from '@/redux/store';
import { setCredentials } from '@/redux/slices/auth-slice';
import { BusinessPicker } from '../organisms/business-picker';
import { readApiError } from '@/redux/services/types';
import { storeSessionTokens as storeTokens } from '@/lib/session/tokens';
import { useSwitchStore } from '@/lib/hooks/use-switch-store';

export const SignInTemplate = () => {
  const { push } = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  // Sign In mutation hook
  const [signIn, { isLoading, isError, error }] = useSignInMutation();
  const { switchStore, switchingId } = useSwitchStore();

  // Multi-business picker state
  const [showBusinessPicker, setShowBusinessPicker] = useState(false);
  const [businesses, setBusinesses] = useState<LoginResponseBusiness[]>([]);

  /** Navigate to the intended destination */
  const goToDashboard = () => {
    const redirectTo = searchParams.get('redirect');
    push(
      redirectTo && redirectTo.startsWith('/')
        ? redirectTo
        : APP_ROUTES.dashboard
    );
    toast.success('Sign in successful!');
  };

  const onSubmit = async (data: SignInFormData) => {
    try {
      const response = await signIn({
        email: data.email,
        password: data.password,
      }).unwrap();

      // 1. Store tokens
      storeTokens(
        response.data.token.access_token,
        response.data.token.refresh_token
      );

      // 2. Dispatch credentials to Redux
      dispatch(
        setCredentials({
          businesses: response.data.businesses ?? [],
          activeBusiness: response.data.active_business ?? null,
          mustChangePassword: response.data.must_change_password ?? false,
        })
      );

      if (PAGES_IN_PROGRESS) return;

      // 3. Check must_change_password FIRST
      if (response.data.must_change_password) {
        push(AUTH_ROUTES.createNewPassword);
        return;
      }

      // 4. Check multi-business
      const biz = response.data.businesses ?? [];
      if (biz.length > 1) {
        setBusinesses(biz);
        setShowBusinessPicker(true);
        return;
      }

      // 5. Single business — go straight to dashboard
      goToDashboard();
    } catch (err: any) {
      const errorMessage = PAGES_IN_PROGRESS
        ? 'Something went wrong'
        : readApiError(err, 'Sign in failed. Please try again.');
      // Unverified account: with the right password the backend sends a new
      // code (or says it couldn't). Go to the code page; if the email didn't
      // go out, Resend is open there straight away.
      if (/verify your email/i.test(errorMessage)) {
        const sendFailed = /couldn't send/i.test(errorMessage);
        if (sendFailed) toast.error(errorMessage);
        else toast.info(errorMessage);
        push(
          `${AUTH_ROUTES.verification}?email=${encodeURIComponent(data.email)}${sendFailed ? '&resend=now' : ''}`
        );
        return;
      }
      toast.error(errorMessage);
    }
  };

  /** Handle business selection from the picker */
  const handleSelectBusiness = async (businessId: string) => {
    // Same switch flow as the shell's store switcher (tokens, active store,
    // cache reset); it shows its own error.
    const switched = await switchStore(businessId);
    if (!switched) return;
    setShowBusinessPicker(false);
    goToDashboard();
  };

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      // Filled in when coming from the shop's "Open a store".
      email: searchParams.get('email') ?? '',
      password: '',
    },
  });

  return (
    <>
      <AuthLayout
        title="Sign In"
        subtitle="Please enter your login details below"
        isError={isError}
        alertTitle="Sign In Error"
        alertDescription={
          // The server's reason (e.g. "this is your shopping account"), not
          // a blanket "invalid" that contradicts the toast.
          error &&
          readApiError(error, 'Invalid email or password. Please try again.')
        }
      >
        <div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className={cn('w-full lg:min-w-[424px] space-y-6')}
            >
              <div className="space-y-6">
                {/* Email Input */}
                <AuthInput
                  control={form.control as any}
                  name="email"
                  label="Business email address"
                  placeholder="Enter your business official email address"
                />

                {/* Password Input */}
                <PasswordInput
                  control={form.control as any}
                  name="password"
                  label="Password"
                  placeholder="Enter your password"
                />
              </div>

              <div className="space-y-8">
                {/* Forget Password */}
                <div className="flex items-center justify-end">
                  <AuthLink
                    href={AUTH_ROUTES.forgotPassword}
                    icon={arrowRight}
                    iconAlt="Arrow right"
                    className="text-xs lg:text-sm"
                  >
                    Forgot password
                  </AuthLink>
                </div>

                <div className="space-y-5">
                  {/* Submit Button */}
                  <SubmitButton
                    size="lg"
                    loading={isLoading}
                    disabled={isLoading}
                  >
                    Sign In
                  </SubmitButton>

                  {/* Sign up link */}
                  <div className="flex items-center justify-center gap-1.5">
                    <p className="font-poppins font-medium text-primary dark:text-gray-300 text-sm">
                      New to Qlozet?
                    </p>
                    <AuthLink
                      href={AUTH_ROUTES.signup}
                      className="text-base underline font-medium dark:text-white"
                    >
                      Sign Up
                    </AuthLink>
                  </div>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </AuthLayout>

      {/* Business Picker Modal */}
      {showBusinessPicker && (
        <BusinessPicker
          businesses={businesses}
          onSelect={handleSelectBusiness}
          isLoading={!!switchingId}
          loadingId={switchingId}
        />
      )}
    </>
  );
};

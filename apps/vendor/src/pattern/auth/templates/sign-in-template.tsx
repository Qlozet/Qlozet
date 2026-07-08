'use client';

import React, { useState } from 'react';
import { AuthLayout } from '../organisms/auth-layout';
import {
  useSignInMutation,
  useSwitchBusinessMutation,
  type LoginResponseBusiness,
} from '@/redux/services/auth/auth.api-slice';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { saveCookie } from '@/lib/helpers/cookies-manager';
import { SESSION_COOKIE_KEY, REFRESH_COOKIE_KEY } from '@/lib/constants';
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
import { setCredentials, setActiveBusiness } from '@/redux/slices/auth-slice';
import { BusinessPicker } from '../organisms/business-picker';


export const SignInTemplate = () => {
  const { push } = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  // Sign In mutation hook
  const [signIn, { isLoading, isError, error }] = useSignInMutation();
  const [switchBusiness] = useSwitchBusinessMutation();

  // Multi-business picker state
  const [showBusinessPicker, setShowBusinessPicker] = useState(false);
  const [businesses, setBusinesses] = useState<LoginResponseBusiness[]>([]);
  const [switchingId, setSwitchingId] = useState<string | null>(null);

  /** Store tokens in cookies */
  const storeTokens = (accessToken: string, refreshToken?: string) => {
    saveCookie({
      key: SESSION_COOKIE_KEY,
      value: accessToken,
      isObject: false,
    });
    if (refreshToken) {
      saveCookie({
        key: REFRESH_COOKIE_KEY,
        value: refreshToken,
        isObject: false,
      });
    }
  };

  /** Navigate to the intended destination */
  const goToDashboard = () => {
    const redirectTo = searchParams.get('redirect');
    push(redirectTo && redirectTo.startsWith('/') ? redirectTo : APP_ROUTES.dashboard);
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
        : err?.data?.message || 'Sign in failed. Please try again.';
      toast.error(errorMessage);
    }
  };

  /** Handle business selection from the picker */
  const handleSelectBusiness = async (businessId: string) => {
    setSwitchingId(businessId);
    try {
      const result = await switchBusiness({ business_id: businessId }).unwrap();

      // Replace tokens with the new ones
      storeTokens(
        result.data.token.access_token,
        result.data.token.refresh_token
      );

      // Update active business in Redux
      dispatch(setActiveBusiness(result.data.active_business));

      setShowBusinessPicker(false);
      goToDashboard();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to switch business');
    } finally {
      setSwitchingId(null);
    }
  };

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  return (
    <>
      <AuthLayout
        title='Sign In'
        subtitle='Please enter your login details below'
        isError={isError}
        alertTitle="Sign In Error"
        alertDescription={error && 'Invalid email or password. Please try again.'}
      >
        <div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className={cn('w-full lg:min-w-[424px] space-y-6')}
            >
              <div className='space-y-6'>
                {/* Email Input */}
                <AuthInput
                  control={form.control as any}
                  name='email'
                  label='Business email address'
                  placeholder='Enter your business official email address'
                />

                {/* Password Input */}
                <PasswordInput
                  control={form.control as any}
                  name='password'
                  label='Password'
                  placeholder='Enter your password'
                />
              </div>

              <div className='space-y-8'>
                {/* Forget Password */}
                <div className='flex items-center justify-end'>
                  <AuthLink
                    href={AUTH_ROUTES.forgotPassword}
                    icon={arrowRight}
                    iconAlt='Arrow right'
                    className='text-xs lg:text-sm'
                  >
                    Forgot password
                  </AuthLink>
                </div>

                <div className='space-y-5'>
                  {/* Submit Button */}
                  <SubmitButton size="lg" loading={isLoading} disabled={isLoading}>
                    Sign In
                  </SubmitButton>

                  {/* Sign up link */}
                  <div className='flex items-center justify-center gap-1.5'>
                    <p className='font-poppins font-medium text-primary dark:text-gray-300 text-sm'>New to Qlozet?</p>
                    <AuthLink
                      href={AUTH_ROUTES.signup}
                      className='text-base underline font-medium dark:text-white'
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

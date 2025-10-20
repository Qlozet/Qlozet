'use client';

import React, { FC } from 'react';
import { AuthLayout } from '../organisms/auth-layout';
import { useSignInMutation } from '@/redux/services/auth/auth.api-slice';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { saveCookie } from '@/lib/helpers/cookies-manager';
import { SESSION_COOKIE_KEY } from '@/lib/constants';
import { APP_ROUTES, AUTH_ROUTES } from '@/lib/routes';
import { Form } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SignInFormData, signInSchema } from '@/lib/validations/auth';
import { AuthInput } from '../atoms/auth-input';
import { PasswordInput } from '../atoms/password-input';
import { AuthLink } from '../atoms/auth-link';
import arrowRight from '@/public/assets/svg/arrow-right.svg';
import { SubmitButton } from '@/patterns/common/molecules/submit-button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangleIcon } from 'lucide-react';


export const SignInTemplate = () => {
  const { push } = useRouter();

  // Sign In mutation hook
  const [signIn, { isLoading, isError, error }] = useSignInMutation();

  const onSubmit = (data: SignInFormData) => {
    signIn({
      email: data.email,
      password: data.password,
    })
      .unwrap()
      .then((response) => {
        // Store token and redirect
        saveCookie({
          key: SESSION_COOKIE_KEY,
          value: response?.data?.token,
          isObject: false,
        });

        push(APP_ROUTES.dashboard);
        toast.success('Sign in successful!');
      }).catch((error) => {
        const errorMessage = error?.data?.message || 'Sign in failed. Please try again.';
        toast.error(errorMessage);
      })
  }

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
      // rememberMe: true
    },
  });
  return (
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
                  <p className='font-poppins font-medium tex-primary text-sm'>New to Qlozet?</p>
                  <AuthLink
                    href={AUTH_ROUTES.signup}
                    className='text-base underline font-medium'
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
  );
};

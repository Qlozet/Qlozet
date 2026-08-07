'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useAdminLoginMutation } from '@/redux/services/auth/auth.api-slice';
import { saveCookie } from '@/lib/helpers/cookies-manager';
import { SESSION_COOKIE_KEY } from '@/lib/constants';
import { APP_ROUTES, AUTH_ROUTES } from '@/lib/routes';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AuthLayout } from '@/pattern/auth/organisms/auth-layout';

const SignInForm = () => {
  const searchParams = useSearchParams();
  const [adminLogin, { isLoading, isError }] = useAdminLoginMutation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    adminLogin({ email, password })
      .unwrap()
      .then((response) => {
        saveCookie({
          key: SESSION_COOKIE_KEY,
          value: response?.data?.token?.access_token || '',
          isObject: false,
        });
        toast.success('Sign in successful!');

        // The auth guard appends ?redirect=<intended path> when it bounces a
        // signed-out visitor; send them back where they were headed. Only
        // same-origin paths are honoured, so the param can't be used to
        // redirect off-site.
        const redirectTo = searchParams.get('redirect');
        const destination =
          redirectTo &&
          redirectTo.startsWith('/') &&
          !redirectTo.startsWith('//')
            ? redirectTo
            : APP_ROUTES.dashboard;

        // A full navigation so the proxy re-reads the cookie it just got.
        window.location.replace(destination);
      })
      .catch((error) => {
        toast.error(
          error?.data?.message || 'Sign in failed. Please try again.'
        );
      });
  };

  return (
    <AuthLayout
      title="Sign In"
      subtitle="Please enter your login details below"
      isError={isError}
      alertTitle="Sign In Error"
      alertDescription="Invalid email or password. Please try again."
    >
      <form onSubmit={onSubmit} className="w-full space-y-6">
        <div className="space-y-6">
          {/* Email */}
          <div className="space-y-1.5">
            <label
              htmlFor="admin-email"
              className="text-sm font-medium text-grey-black"
            >
              Email address
            </label>
            <Input
              id="admin-email"
              type="email"
              autoComplete="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label
              htmlFor="admin-password"
              className="text-sm font-medium text-grey-black"
            >
              Password
            </label>
            <div className="relative">
              <Input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-grey3 hover:text-grey-black transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Forgot password */}
          <div className="flex items-center justify-end">
            <Link
              href={AUTH_ROUTES.forgotPassword}
              className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline lg:text-sm"
            >
              Forgot password
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default function SignInPage() {
  // useSearchParams needs a Suspense boundary in the App Router.
  return (
    <Suspense fallback={null}>
      <SignInForm />
    </Suspense>
  );
}

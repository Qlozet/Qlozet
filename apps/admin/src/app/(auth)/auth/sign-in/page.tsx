'use client';

import React, { useState } from 'react';

import { toast } from 'sonner';
import { useAdminLoginMutation } from '@/redux/services/auth/auth.api-slice';
import { saveCookie } from '@/lib/helpers/cookies-manager';
import { SESSION_COOKIE_KEY } from '@/lib/constants';
import { APP_ROUTES } from '@/lib/routes';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function SignInPage() {

  const [adminLogin, { isLoading, isError }] = useAdminLoginMutation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    adminLogin({ email, password })
      .unwrap()
      .then((response) => {
        saveCookie({
          key: SESSION_COOKIE_KEY,
          value: response?.data?.token?.access_token || '',
          isObject: false,
        });
        toast.success('Sign in successful!');
        // Hard redirect to break out of the (auth) layout
        window.location.href = APP_ROUTES.dashboard;
      })
      .catch((error) => {
        toast.error(error?.data?.message || 'Sign in failed. Please try again.');
      });
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Admin Sign In</h1>
        <p className="mt-1 text-sm text-gray-500">
          Please enter your login details below
        </p>
      </div>

      {isError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Invalid email or password. Please try again.
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-5">
        {/* Email */}
        <div className="space-y-1.5">
          <label htmlFor="admin-email" className="text-sm font-medium text-gray-700">
            Email address
          </label>
          <Input
            id="admin-email"
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label htmlFor="admin-password" className="text-sm font-medium text-gray-700">
            Password
          </label>
          <div className="relative">
            <Input
              id="admin-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="pr-16"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-primary hover:underline"
              tabIndex={-1}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          size="lg"
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>
    </div>
  );
}

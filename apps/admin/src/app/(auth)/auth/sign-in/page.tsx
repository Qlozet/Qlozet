'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminLoginMutation } from '@/redux/services/auth/auth.api-slice';
import { saveCookie } from '@/lib/helpers/cookies-manager';
import { SESSION_COOKIE_KEY } from '@/lib/constants';
import { APP_ROUTES } from '@/lib/routes';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';

export default function SignInPage() {
  const router = useRouter();
  const [adminLogin, { isLoading }] = useAdminLoginMutation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      const response = await adminLogin({ email, password }).unwrap();
      saveCookie({
        key: SESSION_COOKIE_KEY,
        value: response?.data?.token?.access_token || '',
        isObject: false,
      });
      router.push(APP_ROUTES.dashboard);
    } catch (err: any) {
      const message =
        err?.data?.message || 'Invalid credentials. Please try again.';
      setError(message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col items-center space-y-2">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary"
        >
          <ShieldCheck className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-xl font-semibold tracking-tight text-gray-900">
          Admin Sign In
        </h1>
        <p className="text-sm text-gray-500">
          Enter your credentials to access the admin dashboard
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="admin-email" className="text-sm font-medium text-gray-700">
            Email Address
          </label>
          <Input
            id="admin-email"
            type="email"
            placeholder="admin@qlozet.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            className="h-11"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="admin-password" className="text-sm font-medium text-gray-700">
            Password
          </label>
          <div className="relative">
            <Input
              id="admin-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="h-11 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button type="submit" disabled={isLoading} className="w-full h-11">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </Button>
      </form>

      <p className="text-center text-xs text-gray-400">
        Qlozet Admin Panel &middot; Authorized personnel only
      </p>
    </div>
  );
}

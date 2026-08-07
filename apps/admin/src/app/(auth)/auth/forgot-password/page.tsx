'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AUTH_ROUTES } from '@/lib/routes';
import { useForgotPasswordMutation } from '@/redux/services/auth/auth.api-slice';
import { AuthFormCard } from '@/pattern/auth/molecules/auth-form-card';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    try {
      await forgotPassword({ email: trimmed }).unwrap();
      // The confirmation screen echoes the address back, so carry it across.
      router.push(
        `${AUTH_ROUTES.passwordResetCodeSent}?email=${encodeURIComponent(trimmed)}`
      );
    } catch (error) {
      toast.error(
        (error as { data?: { message?: string } })?.data?.message ||
          'Could not send the reset link. Please try again.'
      );
    }
  };

  return (
    <AuthFormCard title="Forgot Password">
      <form onSubmit={onSubmit} className="space-y-8">
        <div className="space-y-1.5">
          <label
            htmlFor="forgot-email"
            className="text-sm font-medium text-grey-black"
          >
            Email address
          </label>
          <Input
            id="forgot-email"
            type="email"
            autoComplete="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={isLoading || !email.trim()}
          className="w-full"
        >
          {isLoading ? 'Sending...' : 'Send password reset link'}
        </Button>
      </form>
    </AuthFormCard>
  );
}

'use client';

import React, { Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AUTH_ROUTES } from '@/lib/routes';
import { useResetPasswordMutation } from '@/redux/services/auth/auth.api-slice';
import { AuthFormCard } from '@/pattern/auth/molecules/auth-form-card';
import {
  PasswordRules,
  allRulesMet,
  buildPasswordRules,
} from '@/pattern/auth/molecules/password-rules';

const PasswordField = ({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) => {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-grey-black">
        {label}
      </label>
      <div className="relative">
        <Input
          id={id}
          type={show ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="••••••••••••••"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required
          className="pr-11"
        />
        <button
          type="button"
          onClick={() => setShow((prev) => !prev)}
          aria-label={show ? `Hide ${label}` : `Show ${label}`}
          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-grey3 transition-colors hover:text-grey-black"
          tabIndex={-1}
        >
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    </div>
  );
};

const CreateNewPasswordForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Prefilled when the user arrives from an emailed link (?token=...), typed
  // by hand when they came through the "code sent" screen.
  const [code, setCode] = useState(searchParams.get('token') ?? '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const rules = useMemo(
    () => buildPasswordRules(password, confirmPassword),
    [password, confirmPassword]
  );
  const canSubmit = Boolean(code.trim()) && allRulesMet(rules);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;

    try {
      await resetPassword({
        token: code.trim(),
        newPassword: password,
      }).unwrap();
      toast.success('Password updated. Please sign in.');
      router.push(AUTH_ROUTES.signIn);
    } catch (error) {
      toast.error(
        (error as { data?: { message?: string } })?.data?.message ||
          'Could not reset your password. The code may have expired.'
      );
    }
  };

  return (
    <AuthFormCard title="Create New Password">
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-1.5">
          <label
            htmlFor="reset-code"
            className="text-sm font-medium text-grey-black"
          >
            Reset code
          </label>
          <Input
            id="reset-code"
            type="text"
            inputMode="text"
            autoComplete="one-time-code"
            placeholder="Enter reset code sent to your email"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            required
          />
        </div>

        <PasswordField
          id="new-password"
          label="New password"
          value={password}
          onChange={setPassword}
        />

        <PasswordField
          id="confirm-password"
          label="Confirm password"
          value={confirmPassword}
          onChange={setConfirmPassword}
        />

        <PasswordRules rules={rules} />

        <Button
          type="submit"
          size="lg"
          disabled={!canSubmit || isLoading}
          className="w-full"
        >
          {isLoading ? 'Creating...' : 'Create new password'}
        </Button>
      </form>
    </AuthFormCard>
  );
};

export default function CreateNewPasswordPage() {
  // useSearchParams needs a Suspense boundary in the App Router.
  return (
    <Suspense fallback={null}>
      <CreateNewPasswordForm />
    </Suspense>
  );
}

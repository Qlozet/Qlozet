'use client';

import { useState, useEffect } from 'react';
import { AuthFormCard } from '../molecules/auth-form-card';
import { Button } from '@/components/ui/button';
import { useCountdown } from '@/lib/hooks/useCountdown';
import {
  useForgotPasswordMutation,
  useVerifyResetCodeMutation,
} from '@/redux/services/auth/auth.api-slice';
import { toast } from 'sonner';
import { If } from '@/pattern/common/atoms/If';
import useCreateSearchQuery from '@/lib/hooks/useCreateSearchQuery';
import { SubmitButton } from '@/pattern/common/molecules/submit-button';
import { AUTH_ROUTES } from '@/lib/routes';

export const PasswordResetCodeSentTemplate = () => {
  const [canResend, setCanResend] = useState(false);
  const [code, setCode] = useState('');

  const { searchParams, createSearchParams } = useCreateSearchQuery();
  const email = searchParams.get('email');

  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const [verifyResetCode, { isLoading: isVerifying }] =
    useVerifyResetCodeMutation();

  // Countdown starting from 90 seconds (1:30)
  const [count, { start, reset }] = useCountdown({
    countStart: 90,
    intervalMs: 1000,
    isIncrement: false,
    countStop: 0,
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (count === 0) setCanResend(true);
  }, [count]);

  useEffect(() => {
    start();
  }, [start]);

  const handleResendCode = async () => {
    if (!canResend || isLoading) return;
    forgotPassword({ businessEmail: email ?? '' })
      .unwrap()
      .then(() => {
        toast.success('Reset code resent. Check your email.');
        setCanResend(false);
        reset();
        start();
      })
      .catch((error: any) => {
        toast.error(
          error?.data?.message || 'Failed to resend code. Please try again.'
        );
      });
  };

  const handleVerify = async () => {
    if (!email) {
      toast.error('Missing email. Please start again.');
      return;
    }
    if (code.trim().length < 6) {
      toast.error('Enter the 6-digit code from your email.');
      return;
    }
    verifyResetCode({ email, code: code.trim() })
      .unwrap()
      .then(() => {
        // Carry the verified email + code to the new-password screen.
        createSearchParams({
          url: AUTH_ROUTES.createNewPassword,
          param: [
            { name: 'email', value: email },
            { name: 'code', value: code.trim() },
          ],
        });
      })
      .catch((error: any) => {
        toast.error(
          error?.data?.message || 'Invalid or expired code. Please try again.'
        );
      });
  };

  return (
    <AuthFormCard title="Enter your reset code" showLogo={true}>
      <div className="space-y-6">
        <p className="text-center text-[hsla(0,0%,7%,1)] dark:text-gray-300 text-sm leading-relaxed">
          We&apos;ve sent a 6-digit code to{' '}
          <span className="font-medium underline">{email}</span>. Enter it below
          to continue. The code expires in 15 minutes.
        </p>

        {/* Code input */}
        <div className="space-y-2">
          <label
            htmlFor="reset-code"
            className="text-sm font-medium text-[hsla(0,0%,7%,1)] dark:text-gray-200"
          >
            Reset code
          </label>
          <input
            id="reset-code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={(e) =>
              setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
            }
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleVerify();
            }}
            placeholder="••••••"
            className="w-full rounded-lg border border-border bg-transparent px-4 py-3 text-center text-lg font-semibold tracking-[0.5em] text-[#333333] dark:text-white placeholder:tracking-[0.5em] placeholder:text-grey3 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <SubmitButton
          disabled={isVerifying || code.length < 6}
          loading={isVerifying}
          onClick={handleVerify}
          type="button"
        >
          Continue
        </SubmitButton>

        {/* Resend with countdown */}
        <div className="flex items-center justify-center gap-2">
          <p className="text-sm text-muted-foreground">
            Didn&apos;t receive a code?
          </p>
          <If isTrue={canResend}>
            <Button
              onClick={handleResendCode}
              disabled={!canResend || isLoading}
              variant="ghost"
              className="text-primary hover:text-primary/80 disabled:opacity-50 p-1 py-1 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Resending...' : 'Resend code'}
            </Button>
          </If>
          <If isTrue={!canResend && count > 0}>
            <p className="text-sm text-muted-foreground">
              Resend in {formatTime(count)}
            </p>
          </If>
        </div>
      </div>
    </AuthFormCard>
  );
};

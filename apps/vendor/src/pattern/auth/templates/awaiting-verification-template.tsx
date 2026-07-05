'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AUTH_ROUTES, APP_ROUTES } from '@/lib/routes';
import { AuthFormCard } from '../molecules/auth-form-card';
import { toast } from 'sonner';
import { SubmitButton } from '@/pattern/common/molecules/submit-button';
import { useCountdown } from '@/lib/hooks/useCountdown';
import { Button } from '@/components/ui/button';
import {
  useVerifyEmailMutation,
  useResendVerificationEmailMutation,
} from '@/redux/services/auth/auth.api-slice';
import { saveCookie } from '@/lib/helpers/cookies-manager';
import { SESSION_COOKIE_KEY } from '@/lib/constants';
import { cn } from '@/lib/utils';

const OTP_LENGTH = 6;

const AwaitingVerificationTemplate = () => {
  const { push } = useRouter();
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [email, setEmail] = useState('');

  // Retrieve stored email
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setEmail(localStorage.getItem('qlozet_verify_email') || '');
    }
  }, []);

  // API mutations
  const [verifyEmail, { isLoading: isVerifying }] = useVerifyEmailMutation();
  const [resendVerificationEmail, { isLoading: isResending }] =
    useResendVerificationEmailMutation();

  // 2-minute (120s) countdown for resend
  const [count, { start, reset: resetCountdown }] = useCountdown({
    countStart: 120,
    intervalMs: 1000,
    isIncrement: false,
    countStop: 0,
  });
  const canResend = count === 0;

  // Start countdown on mount
  useEffect(() => {
    start();
  }, [start]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ─── OTP input handlers ──────────────────────────────────────────
  const handleChange = useCallback(
    (index: number, value: string) => {
      // Only accept digits
      const digit = value.replace(/\D/g, '').slice(-1);
      const newOtp = [...otp];
      newOtp[index] = digit;
      setOtp(newOtp);

      // Auto-focus next input
      if (digit && index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [otp]
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace' && !otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    },
    [otp]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      const pasted = e.clipboardData
        .getData('text')
        .replace(/\D/g, '')
        .slice(0, OTP_LENGTH);
      if (!pasted) return;

      const newOtp = [...otp];
      pasted.split('').forEach((char, i) => {
        newOtp[i] = char;
      });
      setOtp(newOtp);

      // Focus the next empty input or last
      const nextEmpty = newOtp.findIndex((v) => !v);
      const focusIndex =
        nextEmpty === -1 ? OTP_LENGTH - 1 : nextEmpty;
      inputRefs.current[focusIndex]?.focus();
    },
    [otp]
  );

  // ─── Submit ──────────────────────────────────────────────────────
  const code = otp.join('');
  const isCodeComplete = code.length === OTP_LENGTH;

  const handleVerify = () => {
    if (!isCodeComplete) return;

    verifyEmail({ token: code })
      .unwrap()
      .then((response: any) => {
        // Store session token if returned
        const accessToken = response?.data?.token?.access_token;
        if (accessToken) {
          saveCookie({
            key: SESSION_COOKIE_KEY,
            value: accessToken,
            isObject: false,
          });
        }

        // Clean up stored email
        if (typeof window !== 'undefined') {
          localStorage.removeItem('qlozet_verify_email');
        }

        toast.success('Email verified! Welcome to Qlozet.');
        push(accessToken ? APP_ROUTES.dashboard : AUTH_ROUTES.signIn);
      })
      .catch((error: any) => {
        toast.error(
          error?.data?.message ||
            'Invalid or expired verification code. Please try again.'
        );
      });
  };

  const handleResend = () => {
    if (!canResend || isResending || !email) return;

    resendVerificationEmail({ email })
      .unwrap()
      .then(() => {
        toast.success('Verification code resent!');
        resetCountdown();
        start();
      })
      .catch((error: any) => {
        toast.error(
          error?.data?.message || 'Failed to resend code. Please try again.'
        );
      });
  };

  return (
    <AuthFormCard
      title='Verify Your Email'
      subtitle={
        email
          ? `We sent a 6-digit code to ${email}`
          : 'Enter the 6-digit code sent to your email'
      }
      showLogo={true}
    >
      <div className='space-y-6'>
        {/* OTP Inputs */}
        <div className='flex items-center justify-center gap-2 sm:gap-3'>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type='text'
              inputMode='numeric'
              autoComplete='one-time-code'
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              className={cn(
                'size-12 sm:size-14 rounded-lg border-2 bg-background text-center text-xl font-semibold',
                'outline-none transition-all duration-200',
                'focus:border-primary focus:ring-2 focus:ring-primary/20',
                digit
                  ? 'border-primary/60 text-foreground'
                  : 'border-border text-muted-foreground'
              )}
            />
          ))}
        </div>

        {/* Verify Button */}
        <SubmitButton
          type='button'
          size='lg'
          loading={isVerifying}
          disabled={!isCodeComplete || isVerifying}
          onClick={handleVerify}
        >
          Verify Email
        </SubmitButton>

        {/* Resend Section */}
        <div className='text-center space-y-1'>
          <p className='text-sm text-muted-foreground'>
            Didn't receive the code?
          </p>

          {canResend ? (
            <Button
              type='button'
              variant='ghost'
              onClick={handleResend}
              disabled={isResending}
              className='text-primary hover:text-primary/80'
            >
              {isResending ? 'Resending...' : 'Resend Code'}
            </Button>
          ) : (
            <p className='text-sm text-muted-foreground'>
              Resend available in{' '}
              <span className='font-medium text-foreground'>
                {formatTime(count)}
              </span>
            </p>
          )}
        </div>
      </div>
    </AuthFormCard>
  );
};

export default AwaitingVerificationTemplate;
'use client';

import { useState, useEffect, FC } from 'react';
import { AuthFormCard } from '../molecules/auth-form-card';
import { Button } from '@/components/ui/button';
import { useCountdown } from '@/lib/hooks/useCountdown';
import { useForgotPasswordMutation } from '@/redux/services/auth/auth.api-slice';
import { toast } from 'sonner';
import { If } from '@/pattern/common/atoms/If';
import useCreateSearchQuery from '@/lib/hooks/useCreateSearchQuery';

export const PasswordResetCodeSentTemplate = () => {
  const [canResend, setCanResend] = useState(false);

  const { searchParams } = useCreateSearchQuery();
  const email = searchParams.get("email");

  // Forgot password API mutation
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  // Countdown starting from 90 seconds (1:30)
  const [count, { start, reset }] = useCountdown({
    countStart: 90,
    intervalMs: 1000,
    isIncrement: false,
    countStop: 0,
  });

  // Format the countdown as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Enable resend when countdown reaches 0
  useEffect(() => {
    if (count === 0) {
      setCanResend(true);
    }
  }, [count]);

  const handleResendCode = async () => {
    if (!canResend || isLoading) return;

    forgotPassword({
      businessEmail: email ?? '',
    })
      .unwrap()
      .then(() => {
        toast.success('Reset code resent successfully!');

        // Reset countdown and disable resend button
        setCanResend(false);
        reset();
        start();
      })
      .catch((error: any) => {
        const errorMessage =
          error?.data?.message || 'Failed to resend code. Please try again.';

        toast.error(errorMessage);
      })
  };

  // Start countdown on component mount
  useEffect(() => {
    start();
  }, [start]);

  return (
    <AuthFormCard
      title='Reset code sent to email'
      showLogo={true}
    >
      <div className='space-y-6'>
        {/* Email message */}
        <p className='text-center text-[hsla(0,0%,7%,1)] text-sm leading-relaxed'>
          We've sent a code to the email associated with your business account (
          <span className='font-medium underline'>{email}</span>). Please check
          your email inbox and utilize the code provided to create a new
          password.
        </p>

        {/* Resend button with countdown */}
        <div className='flex items-center justify-center gap-2'>
          <p className='text-sm text-muted-foreground'>
            Didn't receive any code?
          </p>

          <If isTrue={canResend ? true : false}>
            <Button
              onClick={handleResendCode}
              disabled={!canResend || isLoading}
              variant='ghost'
              className='text-primary hover:text-primary/80 disabled:opacity-50 p-1 py-1 disabled:cursor-not-allowed'
            >
              {isLoading ? 'Resending...' : 'Resend Code'}
            </Button>
          </If>

          <If isTrue={!canResend && count > 0 ? true : false}>
            <p className='text-sm text-muted-foreground'>
              Resend available in {formatTime(count)}
            </p>
          </If>
        </div>
      </div>
    </AuthFormCard>
  );
};

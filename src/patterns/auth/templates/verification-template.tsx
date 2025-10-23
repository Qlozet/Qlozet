'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AUTH_ROUTES } from '@/lib/routes';
import { AuthLayout } from '../organisms/auth-layout';
import { AuthInput } from '../atoms/auth-input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form } from '@/components/ui/form';
import { toast } from 'sonner';
import { SubmitButton } from '@/patterns/common/molecules/submit-button';
import { useCountdown } from '@/lib/hooks/useCountdown';
import { Button } from '@/components/ui/button';
import { If } from '@/patterns/common/atoms/If';
import { AuthFormCard } from '../molecules/auth-form-card';

const verificationSchema = z.object({
  verificationCode: z
    .string()
    .min(1, 'Verification code is required')
    .length(6, 'Verification code must be 6 digits'),
});

type VerificationFormData = z.infer<typeof verificationSchema>;

export const VerificationTemplate = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);

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

  // Start countdown on component mount
  useEffect(() => {
    start();
  }, [start]);


  const form = useForm<VerificationFormData>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      verificationCode: '',
    },
  });

  const handleVerification = async (data: VerificationFormData) => {
    setIsLoading(true);
    try {
      // TODO: Implement verification API call
      // For now, simulate success
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success('Email verified successfully!');
      router.push(AUTH_ROUTES.signIn);
    } catch (error) {
      toast.error('Invalid verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      // TODO: Implement resend verification code API call
      toast.success('Verification code sent to your email!');
    } catch (error) {
      toast.error('Failed to resend code. Please try again.');
    }
  };

  return (
    <AuthFormCard
      title='Verify Your Email'
      subtitle='Please enter the verification code sent to your email'
      showLogo={true}
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleVerification)}
          className='space-y-6'
        >
          <AuthInput
            control={form.control}
            name='verificationCode'
            label='Verification Code'
            placeholder='Enter 6-digit code'
          />

          <SubmitButton disabled={isLoading} loading={isLoading}>
            Verify Email
          </SubmitButton>

          <div className='text-center'>
            <p className='text-sm text-muted-foreground mb-2'>
              Didn't receive the code?
            </p>

            <If isTrue={canResend ? true : false}>
              <Button
                variant='ghost'
                onClick={handleResendCode}
                className='text-primary hover:text-primary/80'
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
        </form>
      </Form>
    </AuthFormCard>
  );
};

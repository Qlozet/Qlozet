'use client';

import React, { useState } from 'react';
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

const verificationSchema = z.object({
  verificationCode: z
    .string()
    .min(1, 'Verification code is required')
    .length(6, 'Verification code must be 6 digits'),
});

type VerificationFormData = z.infer<typeof verificationSchema>;

interface VerificationTemplateProps {
  className?: string;
}

export const VerificationTemplate: React.FC<VerificationTemplateProps> = ({
  className = '',
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

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
    <AuthLayout
      title='Verify Your Email'
      subtitle='Please enter the verification code sent to your email'
      className={className}
      showImage={false}
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
            description='Check your email for the verification code'
          />

          <SubmitButton disabled={isLoading} loading={isLoading}>
            Verify Email
          </SubmitButton>

          <div className='text-center'>
            <p className='text-sm text-muted-foreground mb-2'>
              Didn't receive the code?
            </p>
           <SubmitButton
              type='button'
              variant='ghost'
              onClick={handleResendCode}
              className='text-primary hover:text-primary/80'
            >
              Resend Code
            </SubmitButton>
          </div>
        </form>
      </Form>
    </AuthLayout>
  );
};

"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '../organisms/auth-layout';
import { AuthInput } from '../atoms/auth-input';
import { AuthButton } from '../atoms/auth-button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import Toast from '@/components/ToastComponent/toast';

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
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast(<Toast text="Email verified successfully!" type="success" />);
      router.push('/auth/sign-in');
    } catch (error) {
      toast(<Toast text="Invalid verification code. Please try again." type="danger" />);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      // TODO: Implement resend verification code API call
      toast(<Toast text="Verification code sent to your email!" type="success" />);
    } catch (error) {
      toast(<Toast text="Failed to resend code. Please try again." type="danger" />);
    }
  };

  return (
    <AuthLayout
      title="Verify Your Email"
      subtitle="Please enter the verification code sent to your email"
      className={className}
      showImage={false}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleVerification)} className="space-y-6">
          <AuthInput
            control={form.control}
            name="verificationCode"
            label="Verification Code"
            placeholder="Enter 6-digit code"
            description="Check your email for the verification code"
          />

          <AuthButton
            type="submit"
            fullWidth
            loading={isLoading}
          >
            Verify Email
          </AuthButton>

          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Didn't receive the code?
            </p>
            <AuthButton
              type="button"
              variant="ghost"
              onClick={handleResendCode}
              className="text-primary hover:text-primary/80"
            >
              Resend Code
            </AuthButton>
          </div>
        </form>
      </Form>
    </AuthLayout>
  );
};
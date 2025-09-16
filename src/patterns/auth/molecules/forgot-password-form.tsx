"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form } from '@/components/ui/form';
import { AuthInput } from '../atoms/auth-input';
import { AuthButton } from '../atoms/auth-button';
import { cn } from '@/lib/utils';

const forgotPasswordSchema = z.object({
  businessEmail: z
    .string()
    .min(1, 'Business email is required')
    .email('Please enter a valid email address'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

interface ForgotPasswordFormProps {
  onSubmit: (data: ForgotPasswordFormData) => void;
  loading?: boolean;
  className?: string;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onSubmit,
  loading = false,
  className = '',
}) => {
  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      businessEmail: '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn('space-y-6', className)}>
        <AuthInput
          control={form.control}
          name="businessEmail"
          label="Business email address"
          type="email"
          placeholder="Enter your business email address"
          description="We'll send a password reset link to this email address"
        />

        <AuthButton
          type="submit"
          fullWidth
          loading={loading}
        >
          Send Reset Link
        </AuthButton>
      </form>
    </Form>
  );
};
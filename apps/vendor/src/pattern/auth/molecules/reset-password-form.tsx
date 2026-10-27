'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form } from '@/components/ui/form';
import { PasswordInput } from '../atoms/password-input';
import { cn } from '@/lib/utils';
import { SubmitButton } from '@/pattern/common/molecules/submit-button';
import { PasswordStrength } from '../organisms/password-strength';

const resetPasswordSchema = z
  .object({
    // Only asked for when setting a password over a temporary one.
    currentPassword: z.string().optional(),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordFormProps {
  onSubmit: (data: ResetPasswordFormData) => void;
  loading?: boolean;
  className?: string;
  /** Ask for the temporary password from the invite email first. */
  withCurrent?: boolean;
  submitLabel?: string;
}

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  onSubmit,
  loading = false,
  className = '',
  withCurrent = false,
  submitLabel = 'Reset Password',
}) => {
  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(
      withCurrent
        ? resetPasswordSchema.refine((d) => !!d.currentPassword, {
            message: 'Enter the temporary password from your invite email',
            path: ['currentPassword'],
          })
        : resetPasswordSchema
    ),
    defaultValues: {
      currentPassword: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = form.watch('password');

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('space-y-6', className)}
      >
        {withCurrent && (
          <PasswordInput
            control={form.control}
            name="currentPassword"
            label="Temporary password"
            placeholder="From your invite email"
          />
        )}

        <PasswordInput
          control={form.control}
          name="password"
          label="New Password"
          placeholder="Enter your new password"
        />

        {/* Confirm Password */}
        <PasswordInput
          control={form.control}
          name="confirmPassword"
          label="Confirm Password"
          placeholder="Confirm your new password"
        />

        <PasswordStrength password={password} />

        <SubmitButton disabled={loading} loading={loading}>
          {submitLabel}
        </SubmitButton>
      </form>
    </Form>
  );
};

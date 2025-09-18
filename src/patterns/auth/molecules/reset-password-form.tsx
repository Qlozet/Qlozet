'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form } from '@/components/ui/form';
import { PasswordInput } from '../atoms/password-input';
import { AuthButton } from '../atoms/auth-button';
import { cn } from '@/lib/utils';

const resetPasswordSchema = z
  .object({
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
}

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  onSubmit,
  loading = false,
  className = '',
}) => {
  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('space-y-6', className)}
      >
        <PasswordInput
          control={form.control}
          name='password'
          label='New Password'
          placeholder='Enter your new password'
          description='Password must be at least 8 characters with uppercase, lowercase, and number'
          showStrengthIndicator
        />

        <PasswordInput
          control={form.control}
          name='confirmPassword'
          label='Confirm Password'
          placeholder='Confirm your new password'
        />

        <AuthButton type='submit' fullWidth loading={loading}>
          Reset Password
        </AuthButton>
      </form>
    </Form>
  );
};

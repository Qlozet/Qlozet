"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form } from '@/components/ui/form';
import { AuthInput } from '../atoms/auth-input';
import { PasswordInput } from '../atoms/password-input';
import { AuthButton } from '../atoms/auth-button';
import { AuthLink } from '../atoms/auth-link';
import { cn } from '@/lib/utils';
import arrowRight from '@/public/assets/svg/arrow-right.svg';

const signInSchema = z.object({
  businessEmail: z
    .string()
    .min(1, 'Business email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

export type SignInFormData = z.infer<typeof signInSchema>;

interface SignInFormProps {
  onSubmit: (data: SignInFormData) => void;
  loading?: boolean;
  className?: string;
}

export const SignInForm: React.FC<SignInFormProps> = ({
  onSubmit,
  loading = false,
  className = '',
}) => {
  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      businessEmail: '',
      password: '',
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
          placeholder="Enter your business official email address"
        />

        <PasswordInput
          control={form.control}
          name="password"
          label="Password"
          placeholder="Enter your password"
        />

        <div className="flex items-center justify-end">
          <AuthLink 
            href="/auth/forgot-password" 
            icon={arrowRight}
            iconAlt="Arrow right"
          >
            Forgot password
          </AuthLink>
        </div>

        <AuthButton
          type="submit"
          fullWidth
          loading={loading}
        >
          Sign In
        </AuthButton>
      </form>
    </Form>
  );
};
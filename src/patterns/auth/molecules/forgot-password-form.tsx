'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form } from '@/components/ui/form';
import { AuthInput } from '../atoms/auth-input';
import { cn } from '@/lib/utils';
import { SubmitButton } from '@/patterns/common/molecules/submit-button';
import { useForgotPasswordMutation } from '@/redux/services/auth/auth.api-slice';
import { toast } from 'sonner';
import { AUTH_ROUTES } from '@/lib/routes';
import { useRouter } from 'next/navigation';
import useCreateSearchQuery from '@/lib/hooks/useCreateSearchQuery';

const forgotPasswordSchema = z.object({
  businessEmail: z
    .string()
    .min(1, 'Business email is required')
    .email('Please enter a valid email address'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const ForgotPasswordForm = () => {
  const { push } = useRouter();
  const { createSearchParams } = useCreateSearchQuery();

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      businessEmail: '',
    },
  });

  // Forgot Password mutation hook
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const onSubmit = async (data: ForgotPasswordFormData) => {
    await forgotPassword({
      email: data.businessEmail,
    })
      .unwrap()
      .then((response) => {

        toast.success(response.message);
        
        createSearchParams({
          url: AUTH_ROUTES.passwordResetCodeSent,
          param: [
            { name: "email", value: data.businessEmail }
          ],
        });
      })
      .catch((error) => {
        const errorMessage =
          error?.data?.message || 'Failed to send reset link. Please try again.';
        toast.error(errorMessage);
      })
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('space-y-6')}
      >
        <AuthInput
          control={form.control}
          name='businessEmail'
          label='Business email address'
          type='email'
          placeholder='Enter your business email address'
        />

        <SubmitButton disabled={isLoading} loading={isLoading}>
          Send Reset Link
        </SubmitButton>
      </form>
    </Form>
  );
};

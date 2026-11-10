'use client';

// Settings → Security: change your own password while signed in.
// POST /auth/change-password checks the current password, also updates a
// linked shopping account on the same email (one email, one password), and
// emails a "password updated" notice.

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { Form } from '@/components/ui/form';
import { PasswordInput } from '@/pattern/auth/atoms/password-input';
import { PasswordStrength } from '@/pattern/auth/organisms/password-strength';
import { SubmitButton } from '@/pattern/common/molecules/submit-button';
import { useChangePasswordMutation } from '@/redux/services/auth/auth.api-slice';
import { readApiError } from '@/redux/services/types';
import {
  changePasswordSchema,
  createDefaultChangePasswordData,
  type ChangePasswordData,
} from '@/lib/validations/auth';
import { FormSectionHeader } from '../atoms/form-section-header';

export const SecurityContent: React.FC = () => {
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const form = useForm<ChangePasswordData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: createDefaultChangePasswordData(),
  });
  const newPassword = form.watch('newPassword');

  const onSubmit = async (data: ChangePasswordData) => {
    try {
      await changePassword(data).unwrap();
      form.reset(createDefaultChangePasswordData());
      toast.success('Password changed', {
        description: 'Use the new one next time you sign in.',
      });
    } catch (error) {
      const message = readApiError(
        error,
        "Couldn't change your password. Please try again."
      );
      // A wrong current password belongs on that field, not only in a toast.
      if (/current password/i.test(message)) {
        form.setError('currentPassword', { message });
        form.setFocus('currentPassword');
        return;
      }
      toast.error(message);
    }
  };

  return (
    <div className="surface-card max-w-xl p-6">
      <FormSectionHeader title="Change password" />
      <div className="mb-6 flex items-start gap-3 text-sm text-muted-foreground">
        <KeyRound className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
        <p>
          You&apos;ll need your current password. If you also shop on Qlozet
          with this email, that account uses the new password too.
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-5"
          noValidate
        >
          <PasswordInput
            control={form.control}
            name="currentPassword"
            label="Current password"
            placeholder="Enter your current password"
          />
          <PasswordInput
            control={form.control}
            name="newPassword"
            label="New password"
            placeholder="Choose a new password"
          />
          <PasswordInput
            control={form.control}
            name="confirmPassword"
            label="Confirm new password"
            placeholder="Type the new password again"
          />
          <PasswordStrength password={newPassword} />
          <SubmitButton disabled={isLoading} loading={isLoading}>
            Change password
          </SubmitButton>
        </form>
      </Form>
    </div>
  );
};

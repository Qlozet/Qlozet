'use client';

import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { AUTH_ROUTES } from '@/lib/routes';
import { AuthLayout } from '../organisms/auth-layout';
import { useRegisterMutation } from '@/redux/services/auth/auth.api-slice';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Form } from '@/components/ui/form';
import { AuthInput } from '../atoms/auth-input';
import { PasswordInput } from '../atoms/password-input';
import { AuthLink } from '../atoms/auth-link';
import { SubmitButton } from '@/pattern/common/molecules/submit-button';
import { Check, X } from 'lucide-react';

// ─── Schema ──────────────────────────────────────────────────────────
const signupSchema = z
  .object({
    businessName: z
      .string()
      .min(2, 'Business name must be at least 2 characters'),
    personalName: z.string().min(1, 'Full name is required'),
    personalEmail: z.string().email('Please enter a valid email address'),
    personalPhone: z.string().min(1, 'Phone number is required'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Must contain uppercase, lowercase, and a number'
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type SignupFormData = z.infer<typeof signupSchema>;

// ─── Password Strength Indicator ─────────────────────────────────────
const PasswordStrength = ({ password }: { password: string }) => {
  const checks = useMemo(
    () => [
      { label: '8+ characters', met: password.length >= 8 },
      { label: 'Uppercase letter', met: /[A-Z]/.test(password) },
      { label: 'Lowercase letter', met: /[a-z]/.test(password) },
      { label: 'Number', met: /\d/.test(password) },
    ],
    [password]
  );

  if (!password) return null;

  return (
    <div className='flex flex-wrap gap-x-4 gap-y-1 mt-2'>
      {checks.map((check) => (
        <span
          key={check.label}
          className={cn(
            'flex items-center gap-1 text-xs transition-colors',
            check.met ? 'text-green-600' : 'text-muted-foreground'
          )}
        >
          {check.met ? (
            <Check className='size-3' />
          ) : (
            <X className='size-3' />
          )}
          {check.label}
        </span>
      ))}
    </div>
  );
};

// ─── Template ────────────────────────────────────────────────────────
export const SignupTemplate = () => {
  const { push } = useRouter();
  const [register, { isLoading }] = useRegisterMutation();

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange',
    defaultValues: {
      businessName: '',
      personalName: '',
      personalEmail: '',
      personalPhone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const passwordValue = form.watch('password');

  const onSubmit = (data: SignupFormData) => {
    const phone = data.personalPhone.startsWith('+')
      ? data.personalPhone
      : `+234${data.personalPhone.replace(/^0/, '')}`;

    register({
      business_name: data.businessName,
      personal_name: data.personalName,
      personal_email: data.personalEmail,
      personal_phone_number: phone,
      password: data.password,
    })
      .unwrap()
      .then(() => {
        // Store email for the verification step
        if (typeof window !== 'undefined') {
          localStorage.setItem('qlozet_verify_email', data.personalEmail);
        }

        toast.success(
          'Account created! Please check your email to verify.'
        );
        push(AUTH_ROUTES.awaitingVerification);
      })
      .catch((error: any) => {
        const status = error?.status;
        const message =
          error?.data?.message ||
          (status === 409
            ? 'An account with this email or business already exists.'
            : 'Failed to create account. Please try again.');
        toast.error(message);
      });
  };

  return (
    <AuthLayout
      title='Create Your Vendor Account'
      subtitle='Start selling on Qlozet in under a minute'
      showImage={true}
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={cn('w-full lg:min-w-[424px] space-y-5')}
        >
          {/* Business Name */}
          <AuthInput
            control={form.control as any}
            name='businessName'
            label='Business Name'
            placeholder='Your brand or store name'
          />

          {/* Full Name */}
          <AuthInput
            control={form.control as any}
            name='personalName'
            label='Full Name'
            placeholder='John Doe'
          />

          {/* Email */}
          <AuthInput
            control={form.control as any}
            name='personalEmail'
            label='Email Address'
            type='email'
            placeholder='you@example.com'
          />

          {/* Phone */}
          <AuthInput
            control={form.control as any}
            name='personalPhone'
            label='Phone Number'
            type='tel'
            placeholder='08012345679'
          />

          {/* Password */}
          <div>
            <PasswordInput
              control={form.control as any}
              name='password'
              label='Password'
              placeholder='Min 8 characters'
            />
            <PasswordStrength password={passwordValue} />
          </div>

          {/* Confirm Password */}
          <PasswordInput
            control={form.control as any}
            name='confirmPassword'
            label='Confirm Password'
            placeholder='Re-enter password'
          />

          {/* Submit */}
          <div className='pt-2 space-y-5'>
            <SubmitButton size='lg' loading={isLoading} disabled={isLoading}>
              Create Account
            </SubmitButton>

            {/* Sign-in link */}
            <div className='flex items-center justify-center gap-1.5'>
              <p className='font-poppins font-medium text-primary text-sm'>
                Already have an account?
              </p>
              <AuthLink
                href={AUTH_ROUTES.signIn}
                className='text-base underline font-medium'
              >
                Sign In
              </AuthLink>
            </div>
          </div>
        </form>
      </Form>
    </AuthLayout>
  );
};

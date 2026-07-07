'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { AUTH_ROUTES, APP_ROUTES } from '@/lib/routes';
import { AuthLayout } from '../organisms/auth-layout';
import {
  useRegisterMutation,
  useVerifyEmailMutation,
  useResendVerificationEmailMutation,
} from '@/redux/services/auth/auth.api-slice';
import { saveCookie } from '@/lib/helpers/cookies-manager';
import { SESSION_COOKIE_KEY } from '@/lib/constants';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Form } from '@/components/ui/form';
import { AuthInput } from '../atoms/auth-input';
import { PasswordInput } from '../atoms/password-input';
import { AuthLink } from '../atoms/auth-link';
import { SubmitButton } from '@/pattern/common/molecules/submit-button';
import { Check, X, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCountdown } from '@/lib/hooks/useCountdown';
import { Progress } from '@/components/ui/progress';

// ─── Types ───────────────────────────────────────────────────────────
type SignupStep = 'details' | 'password' | 'otp';

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

// ─── Password Strength Checklist ─────────────────────────────────────
const PasswordChecklist = ({ password, confirmPassword }: { password: string; confirmPassword: string }) => {
  const checks = useMemo(
    () => [
      { label: 'At least 8 characters', met: password.length >= 8 },
      { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
      { label: 'Contains lowercase letter', met: /[a-z]/.test(password) },
      { label: 'Contains a number', met: /\d/.test(password) },
      { label: 'Passwords match', met: !!password && password === confirmPassword },
    ],
    [password, confirmPassword]
  );

  if (!password) return null;

  return (
    <div className='flex flex-col gap-2 mt-3'>
      {checks.map((check) => (
        <div key={check.label} className='flex items-center gap-2.5'>
          <span
            className={cn(
              'flex items-center justify-center size-5 rounded-full shrink-0 transition-colors',
              check.met
                ? 'bg-primary text-white'
                : 'bg-muted border border-border'
            )}
          >
            {check.met && <Check className='size-3' strokeWidth={3} />}
          </span>
          <span
            className={cn(
              'text-xs transition-colors',
              check.met ? 'text-foreground font-medium' : 'text-muted-foreground'
            )}
          >
            {check.label}
          </span>
        </div>
      ))}
    </div>
  );
};

// ─── OTP Input Component ─────────────────────────────────────────────
const OTP_LENGTH = 6;

const OtpInput = ({
  otp,
  onChange,
  onKeyDown,
  onPaste,
  inputRefs,
}: {
  otp: string[];
  onChange: (index: number, value: string) => void;
  onKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
  onPaste: (e: React.ClipboardEvent) => void;
  inputRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
}) => (
  <div className='flex items-center justify-center gap-2 sm:gap-3'>
    {otp.map((digit, index) => (
      <input
        key={index}
        ref={(el) => { inputRefs.current[index] = el; }}
        type='text'
        inputMode='numeric'
        autoComplete='one-time-code'
        maxLength={1}
        value={digit}
        onChange={(e) => onChange(index, e.target.value)}
        onKeyDown={(e) => onKeyDown(index, e)}
        onPaste={index === 0 ? onPaste : undefined}
        className={cn(
          'size-12 sm:size-14 rounded-lg border-2 bg-background text-center text-xl font-semibold',
          'outline-none transition-all duration-200',
          'focus:border-primary focus:ring-2 focus:ring-primary/20',
          digit
            ? 'border-primary/60 text-foreground'
            : 'border-border text-muted-foreground'
        )}
      />
    ))}
  </div>
);

// ─── Template ────────────────────────────────────────────────────────
export const SignupTemplate = () => {
  const { push } = useRouter();
  const [step, setStep] = useState<SignupStep>('details');
  const [registeredEmail, setRegisteredEmail] = useState('');

  // API mutations
  const [register, { isLoading: isRegistering }] = useRegisterMutation();
  const [verifyEmail, { isLoading: isVerifying }] = useVerifyEmailMutation();
  const [resendVerificationEmail, { isLoading: isResending }] = useResendVerificationEmailMutation();

  // Form
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
  const confirmPasswordValue = form.watch('confirmPassword');

  // Step progress
  const STEPS: SignupStep[] = ['details', 'password', 'otp'];
  const stepIndex = STEPS.indexOf(step);
  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  const stepTitles: Record<SignupStep, { title: string; subtitle: string }> = {
    details: {
      title: 'Create Your Vendor Account',
      subtitle: 'Start selling on Qlozet in under a minute',
    },
    password: {
      title: 'Secure Your Account',
      subtitle: 'Create a strong password to protect your account',
    },
    otp: {
      title: 'Verify Your Email',
      subtitle: `We sent a 6-digit code to ${registeredEmail}`,
    },
  };

  // ─── Step 1: Details → Step 2 ────────────────────────────────────
  const handleDetailsNext = async () => {
    const isValid = await form.trigger([
      'businessName',
      'personalName',
      'personalEmail',
      'personalPhone',
    ]);
    if (isValid) {
      setStep('password');
    }
  };

  // ─── Step 2: Password → Submit & go to OTP ──────────────────────
  const handlePasswordSubmit = async () => {
    const isValid = await form.trigger(['password', 'confirmPassword']);
    if (!isValid) return;

    const data = form.getValues();
    const phone = data.personalPhone.startsWith('+')
      ? data.personalPhone
      : `+234${data.personalPhone.replace(/^0/, '')}`;

    try {
      await register({
        business_name: data.businessName,
        personal_name: data.personalName,
        personal_email: data.personalEmail,
        personal_phone_number: phone,
        password: data.password,
      }).unwrap();

      setRegisteredEmail(data.personalEmail);
      toast.success('Account created! Please check your email to verify.');
      setStep('otp');
    } catch (error: any) {
      const status = error?.status;
      const message =
        error?.data?.message ||
        (status === 409
          ? 'An account with this email or business already exists.'
          : 'Failed to create account. Please try again.');
      toast.error(message);
    }
  };

  // ─── Step 3: OTP ─────────────────────────────────────────────────
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const code = otp.join('');
  const isCodeComplete = code.length === OTP_LENGTH;

  // Resend countdown (2 minutes)
  const [count, { start: startCountdown, reset: resetCountdown }] = useCountdown({
    countStart: 120,
    intervalMs: 1000,
    isIncrement: false,
    countStop: 0,
  });
  const canResend = count === 0;

  // Start countdown when entering OTP step
  useEffect(() => {
    if (step === 'otp') {
      startCountdown();
    }
  }, [step, startCountdown]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = useCallback(
    (index: number, value: string) => {
      const digit = value.replace(/\D/g, '').slice(-1);
      const newOtp = [...otp];
      newOtp[index] = digit;
      setOtp(newOtp);
      if (digit && index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [otp]
  );

  const handleOtpKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace' && !otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    },
    [otp]
  );

  const handleOtpPaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
      if (!pasted) return;
      const newOtp = [...otp];
      pasted.split('').forEach((char, i) => { newOtp[i] = char; });
      setOtp(newOtp);
      const nextEmpty = newOtp.findIndex((v) => !v);
      inputRefs.current[nextEmpty === -1 ? OTP_LENGTH - 1 : nextEmpty]?.focus();
    },
    [otp]
  );

  const handleVerify = async () => {
    if (!isCodeComplete) return;
    try {
      const response: any = await verifyEmail({ token: code }).unwrap();
      const accessToken = response?.data?.token?.access_token;
      if (accessToken) {
        saveCookie({ key: SESSION_COOKIE_KEY, value: accessToken, isObject: false });
      }
      toast.success('Email verified! Welcome to Qlozet.');
      push(accessToken ? APP_ROUTES.dashboard : AUTH_ROUTES.signIn);
    } catch (error: any) {
      toast.error(error?.data?.message || 'Invalid or expired verification code.');
    }
  };

  const handleResend = async () => {
    if (!canResend || isResending || !registeredEmail) return;
    try {
      await resendVerificationEmail({ email: registeredEmail }).unwrap();
      toast.success('Verification code resent!');
      resetCountdown();
      startCountdown();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to resend code.');
    }
  };

  // ─── Back navigation ────────────────────────────────────────────
  const handleBack = () => {
    if (step === 'password') setStep('details');
  };

  // ─── Render ──────────────────────────────────────────────────────
  const current = stepTitles[step];

  return (
    <AuthLayout
      title={current.title}
      subtitle={current.subtitle}
      showImage={step !== 'otp'}
    >
      <Form {...form}>
        <div className={cn('w-full lg:min-w-[424px] space-y-6')}>
          {/* Progress Bar */}
          {step !== 'otp' && (
            <div className='space-y-2'>
              <div className='flex justify-between text-sm text-muted-foreground'>
                <span>
                  Step {stepIndex + 1} of {STEPS.length}
                </span>
              </div>
              <Progress value={progress} className='h-1.5' />
            </div>
          )}

          {/* Back Button */}
          {step === 'password' && (
            <button
              type='button'
              onClick={handleBack}
              className='flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors'
            >
              <ArrowLeft className='size-4' />
              Back
            </button>
          )}

          {/* ─── STEP 1: DETAILS ─────────────────────────────────── */}
          {step === 'details' && (
            <div className='space-y-5 animate-in fade-in duration-300'>
              <AuthInput
                control={form.control as any}
                name='businessName'
                label='Business Name'
                placeholder='Your brand or store name'
              />
              <AuthInput
                control={form.control as any}
                name='personalName'
                label='Full Name'
                placeholder='John Doe'
              />
              <AuthInput
                control={form.control as any}
                name='personalEmail'
                label='Email Address'
                type='email'
                placeholder='you@example.com'
              />
              <AuthInput
                control={form.control as any}
                name='personalPhone'
                label='Phone Number'
                type='tel'
                placeholder='08012345679'
              />

              <div className='pt-2 space-y-5'>
                <Button
                  type='button'
                  size='lg'
                  className='w-full'
                  onClick={handleDetailsNext}
                >
                  Continue
                </Button>

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
            </div>
          )}

          {/* ─── STEP 2: PASSWORD ────────────────────────────────── */}
          {step === 'password' && (
            <div className='space-y-5 animate-in fade-in duration-300'>
              <PasswordInput
                control={form.control as any}
                name='password'
                label='Password'
                placeholder='Min 8 characters'
              />
              <PasswordInput
                control={form.control as any}
                name='confirmPassword'
                label='Confirm Password'
                placeholder='Re-enter password'
              />

              <PasswordChecklist
                password={passwordValue}
                confirmPassword={confirmPasswordValue}
              />

              <div className='pt-2'>
                <SubmitButton
                  type='button'
                  size='lg'
                  loading={isRegistering}
                  disabled={isRegistering}
                  onClick={handlePasswordSubmit}
                >
                  Create Account
                </SubmitButton>
              </div>
            </div>
          )}

          {/* ─── STEP 3: OTP VERIFICATION ────────────────────────── */}
          {step === 'otp' && (
            <div className='space-y-6 animate-in fade-in duration-300'>
              <OtpInput
                otp={otp}
                onChange={handleOtpChange}
                onKeyDown={handleOtpKeyDown}
                onPaste={handleOtpPaste}
                inputRefs={inputRefs}
              />

              <SubmitButton
                type='button'
                size='lg'
                loading={isVerifying}
                disabled={!isCodeComplete || isVerifying}
                onClick={handleVerify}
              >
                Verify Email
              </SubmitButton>

              <div className='text-center space-y-1'>
                <p className='text-sm text-muted-foreground'>
                  Didn't receive the code?
                </p>
                {canResend ? (
                  <Button
                    type='button'
                    variant='ghost'
                    onClick={handleResend}
                    disabled={isResending}
                    className='text-primary hover:text-primary/80'
                  >
                    {isResending ? 'Resending...' : 'Resend Code'}
                  </Button>
                ) : (
                  <p className='text-sm text-muted-foreground'>
                    Resend available in{' '}
                    <span className='font-medium text-foreground'>
                      {formatTime(count)}
                    </span>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </Form>
    </AuthLayout>
  );
};

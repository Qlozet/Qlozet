'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { AUTH_ROUTES } from '@/lib/routes';
import { useForgotPasswordMutation } from '@/redux/services/auth/auth.api-slice';
import { AuthFormCard } from '@/pattern/auth/molecules/auth-form-card';

const CodeSent = () => {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const resend = async () => {
    if (!email) return;
    try {
      await forgotPassword({ email }).unwrap();
      toast.success('Reset code sent again. Check your inbox.');
    } catch (error) {
      toast.error(
        (error as { data?: { message?: string } })?.data?.message ||
          'Could not resend the code. Please try again.'
      );
    }
  };

  return (
    <AuthFormCard title="Reset code sent to email">
      <div className="space-y-6 text-center">
        <p className="text-sm leading-relaxed text-grey-black">
          We&apos;ve sent a code to the email associated with your Qlozet admin
          account
          {email ? (
            <>
              {' ('}
              <span className="underline">{email}</span>
              {')'}
            </>
          ) : null}
          . Please check your email inbox and utilize the code provided to
          create a new password.
        </p>

        <div className="space-y-3">
          <Button asChild size="lg" className="w-full">
            <Link href={AUTH_ROUTES.createNewPassword}>Enter reset code</Link>
          </Button>

          {/* Only offered when we know which address to resend to. */}
          {email && (
            <button
              type="button"
              onClick={resend}
              disabled={isLoading}
              className="w-full cursor-pointer text-sm font-medium text-primary hover:underline disabled:opacity-50"
            >
              {isLoading ? 'Resending...' : "Didn't get it? Resend code"}
            </button>
          )}
        </div>
      </div>
    </AuthFormCard>
  );
};

export default function PasswordResetCodeSentPage() {
  // useSearchParams needs a Suspense boundary in the App Router.
  return (
    <Suspense fallback={null}>
      <CodeSent />
    </Suspense>
  );
}

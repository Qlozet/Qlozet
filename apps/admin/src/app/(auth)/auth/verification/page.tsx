import { AuthLayout } from '@/pattern/auth/organisms/auth-layout';

export default function VerificationPage() {
  return (
    <AuthLayout
      title="Verification"
      subtitle="Enter the code we sent to your email"
    >
      {/* TODO: build this screen — see the vendor app's equivalent template. */}
      <p className="text-sm text-grey3">
        Mirror of vendor /auth/verification. Replace with the admin verification
        flow.
      </p>
    </AuthLayout>
  );
}

import { AuthLayout } from '@/pattern/auth/organisms/auth-layout';

export default function SignUpPage() {
  return (
    <AuthLayout title="Create account" subtitle="Set up a Qlozet admin account">
      {/* TODO: build this screen — see the vendor app's equivalent template. */}
      <p className="text-sm text-grey3">
        Mirror of vendor /auth/sign-up. Replace with the admin sign-up form.
      </p>
    </AuthLayout>
  );
}

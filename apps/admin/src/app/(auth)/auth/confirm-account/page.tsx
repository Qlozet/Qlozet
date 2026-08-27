import { AuthLayout } from '@/pattern/auth/organisms/auth-layout';

export default function ConfirmAccountPage() {
  return (
    <AuthLayout
      title="Confirm account"
      subtitle="Finish setting up your admin account"
    >
      {/* TODO: build this screen — see the vendor app's equivalent template. */}
      <p className="text-sm text-grey3 dark:text-gray-400">
        Mirror of vendor /auth/confirm-account. Replace with the admin account
        confirmation flow.
      </p>
    </AuthLayout>
  );
}

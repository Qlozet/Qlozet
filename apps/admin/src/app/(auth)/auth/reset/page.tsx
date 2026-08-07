import { redirect } from 'next/navigation';

import { AUTH_ROUTES } from '@/lib/routes';

/**
 * Password-reset links land here. There's one reset form (Create New Password)
 * — it accepts the code typed by hand or prefilled from `?token=` — so this
 * route just forwards, carrying the token across.
 */
export default async function ResetPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  redirect(
    token
      ? `${AUTH_ROUTES.createNewPassword}?token=${encodeURIComponent(token)}`
      : AUTH_ROUTES.createNewPassword
  );
}

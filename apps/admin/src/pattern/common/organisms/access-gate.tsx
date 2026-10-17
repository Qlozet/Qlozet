'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldOff } from 'lucide-react';
import { APP_ROUTES } from '@/lib/routes';
import {
  RESOURCE_LABELS,
  formatAccessRole,
  resourceForPath,
  type ConsoleResource,
} from '@/lib/access';
import { useConsoleAccess } from '@/lib/hooks/use-console-access';
import { ForcedPasswordChange } from './forced-password-change';

export const NoAccessPanel = ({
  resource,
  roleName,
}: {
  resource: ConsoleResource;
  roleName: string | null;
}) => (
  <div
    role="status"
    className="mx-auto flex min-h-[60vh] w-full max-w-lg flex-col items-center justify-center text-center"
  >
    <span className="mb-4 flex size-14 items-center justify-center rounded-full bg-gray-100 dark:bg-muted">
      <ShieldOff className="size-6 text-gray-500 dark:text-gray-400" />
    </span>
    <h1 className="text-lg font-bold text-[hsla(210,9%,31%,1)] dark:text-white">
      You do not have access to {RESOURCE_LABELS[resource]}
    </h1>
    <p className="mt-2 max-w-sm text-sm text-gray-500 dark:text-gray-400">
      {roleName ? `Your role, ${roleName}, ` : 'Your role '}
      does not include this area. A super admin can change that under Admin
      &rsaquo; Manage Roles.
    </p>
    <Link
      href={APP_ROUTES.dashboard}
      className="mt-6 inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
    >
      Back to dashboard
    </Link>
  </div>
);

/**
 * Wraps every console page. Two things stop the page from rendering: a
 * temporary password that has not been changed yet (the API refuses
 * everything else anyway), and a page the account's role cannot view. While
 * access is still loading, or if the read failed, the page renders and the
 * server has the final say.
 */
export const AccessGate = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const { access, refetch, canView } = useConsoleAccess();

  if (access?.must_change_password) {
    return <ForcedPasswordChange onChanged={() => void refetch()} />;
  }

  const resource = resourceForPath(pathname ?? '');
  if (access && resource && !canView(resource)) {
    return (
      <NoAccessPanel resource={resource} roleName={formatAccessRole(access)} />
    );
  }

  return <>{children}</>;
};

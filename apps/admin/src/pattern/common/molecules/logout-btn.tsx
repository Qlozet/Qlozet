'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import LogoutIcon from '../atoms/nav-icons/logout-icon';
import { AUTH_ROUTES } from '@/lib/routes';
import { cn } from '@/lib/utils';

interface LogoutBtnProps {
  /** Drawer mode — the label is always visible rather than width-gated. */
  expanded?: boolean;
}

const LogoutBtn = ({ expanded = false }: LogoutBtnProps) => {
  const router = useRouter();

  const handleLogout = () => {
    // Clear any locally persisted admin session data, then return to sign in.
    if (typeof window !== 'undefined') {
      localStorage.removeItem('AltireuserDetails');
    }
    router.push(AUTH_ROUTES.signIn);
  };

  return (
    <>
      <button
        className={cn(
          'w-fit 2xl:w-full flex items-center gap-3 2xl:px-4 py-3 text-gray-700 dark:text-gray-200 hover:text-destructive rounded-lg cursor-pointer transition-colors',
          expanded && 'w-full px-4'
        )}
        onClick={handleLogout}
      >
        <LogoutIcon className="w-[25.25] h-[24px] 2xl:w-5 2xl:h-5" />
        <span
          className={cn(
            'text-sm font-normal',
            expanded
              ? 'inline-block'
              : 'invisible hidden 2xl:visible 2xl:inline-block'
          )}
        >
          Logout
        </span>
      </button>
    </>
  );
};

export default LogoutBtn;

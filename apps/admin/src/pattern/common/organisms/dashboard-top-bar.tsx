'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, LogOut, Sparkles, User } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { APP_ROUTES, AUTH_ROUTES } from '@/lib/routes';
import { SESSION_COOKIE_KEY } from '@/lib/constants';
import { removeCookie } from '@/lib/helpers/cookies-manager';
import { initialsFrom, readUserAvatar, readUserName } from '@/lib/current-user';
import { useGetCurrentUserQuery } from '@/redux/services/users/users.api-slice';
import { useGetUnreadCountQuery } from '@/redux/services/notifications/notifications.api-slice';
import { useGetLatestDigestQuery } from '@/redux/services/assistant/assistant.api-slice';
import { AssistantChatSheet } from '@/pattern/assistant/organisms/assistant-chat-sheet';

interface DashboardTopBarProps {
  /** Optional override for the page title. Defaults to the current route. */
  title?: string;
}

const deriveTitle = (pathname: string): string => {
  const segments = pathname.replace(/^\//, '').split('/').filter(Boolean);
  const last = segments[segments.length - 1] ?? 'dashboard';
  return last.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
};

export const DashboardTopBar = ({ title }: DashboardTopBarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const [showAssistant, setShowAssistant] = useState(false);

  const pageTitle = useMemo(
    () => title ?? deriveTitle(pathname),
    [title, pathname]
  );

  // Signed-in user — no hardcoded fallback name; a skeleton shows until it lands.
  const { data: userResponse, isLoading: isLoadingUser } =
    useGetCurrentUserQuery();
  const user = userResponse?.data;
  const userName = readUserName(user);
  const userEmail = typeof user?.email === 'string' ? user.email : null;
  const avatarUrl = readUserAvatar(user);

  // Mirrors the 401 middleware's teardown: drop the session cookie and any
  // locally persisted profile, then hard-navigate so every cache is dropped.
  const handleLogout = () => {
    removeCookie(SESSION_COOKIE_KEY);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('AltireuserDetails');
      window.location.replace(AUTH_ROUTES.signIn);
    }
  };

  // Unread badge, polled the same way the vendor top bar does.
  const { data: unreadData } = useGetUnreadCountQuery(undefined, {
    pollingInterval: 60_000,
  });
  const unreadCount = unreadData?.data?.total ?? 0;

  const { data: digestData } = useGetLatestDigestQuery();
  const digestUnread = digestData?.data?.unread ?? 0;

  return (
    <div className="w-full flex items-center justify-between gap-4 bg-white py-3 px-5 lg:px-6 rounded-2xl shadow-[0px_4px_10px_#AEAEC026]">
      {/* Page title */}
      <h1 className="text-[18px] font-semibold text-grey-black truncate">
        {pageTitle}
      </h1>

      {/* Right cluster */}
      <div className="flex items-center justify-end gap-3 lg:gap-4">
        {/* AI assistant */}
        <button
          type="button"
          onClick={() => setShowAssistant(true)}
          aria-label="Ask the assistant"
          className="relative flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#F8F9FA] text-primary hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <Sparkles className="h-5 w-5" />
          {digestUnread > 0 && (
            <span className="absolute -right-1 -top-1 size-2.5 rounded-full bg-primary ring-2 ring-white" />
          )}
        </button>

        {/* Notifications */}
        <button
          type="button"
          onClick={() => router.push(APP_ROUTES.notifications)}
          aria-label={
            unreadCount > 0
              ? `Notifications, ${unreadCount} unread`
              : 'Notifications'
          }
          className="relative flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#F8F9FA] text-grey3 hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-error text-[10px] font-bold text-white ring-2 ring-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Signed-in user */}
        {isLoadingUser && !userName ? (
          <Skeleton className="hidden h-4 w-28 rounded md:block" />
        ) : userName ? (
          <span className="hidden md:block text-sm font-medium text-grey-black max-w-45 truncate">
            {userName}
          </span>
        ) : null}

        {/* Profile menu.
            Deliberately not a link to /settings: that route is still gated
            behind the sidebar's WIP modal, so sending people there from here
            would route around the gate onto an unfinished page. */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Account menu"
              className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-border bg-[#F8F9FA] text-grey3 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={userName ?? 'Profile'}
                  width={36}
                  height={36}
                  className="h-full w-full object-cover"
                  unoptimized
                />
              ) : userName ? (
                <span className="text-xs font-semibold text-grey-black">
                  {initialsFrom(userName)}
                </span>
              ) : (
                <User className="h-5 w-5" />
              )}
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <p className="text-sm font-medium text-grey-black truncate">
                {userName ?? 'Signed in'}
              </p>
              {userEmail && userEmail !== userName && (
                <p className="text-xs text-grey3 truncate">{userEmail}</p>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => router.push(APP_ROUTES.notifications)}
              className="cursor-pointer"
            >
              <Bell className="mr-2 size-4" />
              Notifications
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={handleLogout}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 size-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AssistantChatSheet
        open={showAssistant}
        onOpenChange={setShowAssistant}
      />
    </div>
  );
};

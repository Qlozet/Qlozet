'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, Sparkles, User } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { APP_ROUTES } from '@/lib/routes';
import { initialsFrom, readUserAvatar, readUserName } from '@/lib/current-user';
import { useGetCurrentUserQuery } from '@/redux/services/users/users.api-slice';
import { useGetUnreadCountQuery } from '@/redux/services/notifications/notifications.api-slice';
import { useGetLatestDigestQuery } from '@/redux/services/assistant/assistant.api-slice';
import { AssistantChatSheet } from '@/pattern/assistant/organisms/assistant-chat-sheet';
import { ProfileSheet } from './profile-sheet';

interface DashboardTopBarProps {
  /** Optional override for the page title. Defaults to the current route. */
  title?: string;
}

// Detail routes end in a record id. Titling from the last segment would put a
// raw ObjectId in the header, so those fall back to the parent section.
const DETAIL_TITLES: Record<string, string> = {
  vendors: 'Vendor details',
  customers: 'Customer details',
  orders: 'Order details',
  support: 'Ticket details',
  products: 'Product details',
};

const isRecordId = (segment: string): boolean =>
  /^[a-f0-9]{24}$/i.test(segment) || // Mongo ObjectId
  /^[0-9a-f-]{36}$/i.test(segment) || // uuid
  /^\d+$/.test(segment); // numeric id

const titleCase = (segment: string): string =>
  segment.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

const deriveTitle = (pathname: string): string => {
  const segments = pathname.replace(/^\//, '').split('/').filter(Boolean);
  const last = segments[segments.length - 1] ?? 'dashboard';

  if (isRecordId(last) && segments.length > 1) {
    const parent = segments[segments.length - 2];
    // Fall back to a singularised parent for sections not in the map.
    return (
      DETAIL_TITLES[parent] ?? `${titleCase(parent.replace(/s$/, ''))} details`
    );
  }

  return titleCase(last);
};

export const DashboardTopBar = ({ title }: DashboardTopBarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const [showAssistant, setShowAssistant] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const pageTitle = useMemo(
    () => title ?? deriveTitle(pathname),
    [title, pathname]
  );

  // Signed-in user — no hardcoded fallback name; a skeleton shows until it lands.
  const { data: userResponse, isLoading: isLoadingUser } =
    useGetCurrentUserQuery();
  const user = userResponse?.data;
  const userName = readUserName(user);
  const avatarUrl = readUserAvatar(user);

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

        {/* Opens the full profile drawer, matching the vendor app. */}
        <button
          type="button"
          onClick={() => setShowProfile(true)}
          aria-label="Open profile"
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
      </div>

      <AssistantChatSheet
        open={showAssistant}
        onOpenChange={setShowAssistant}
      />

      <ProfileSheet open={showProfile} onOpenChange={setShowProfile} />
    </div>
  );
};

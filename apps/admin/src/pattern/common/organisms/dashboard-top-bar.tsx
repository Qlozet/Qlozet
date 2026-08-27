'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, Menu, Sparkles, User } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { APP_ROUTES } from '@/lib/routes';
import { initialsFrom, readUserAvatar, readUserName } from '@/lib/current-user';
import { useGetCurrentUserQuery } from '@/redux/services/users/users.api-slice';
import { useGetUnreadCountQuery } from '@/redux/services/notifications/notifications.api-slice';
import { useGetLatestDigestQuery } from '@/redux/services/assistant/assistant.api-slice';
import { AssistantChatSheet } from '@/pattern/assistant/organisms/assistant-chat-sheet';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SidebarNav } from '@/pattern/common/templates/sidebar';
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
  // The sidebar rail is hidden below lg, so this drawer is the only navigation
  // on small screens.
  const [showNav, setShowNav] = useState(false);

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
    <div className="w-full flex items-center justify-between gap-4 bg-white dark:bg-card py-3 px-5 lg:px-6 rounded-2xl shadow-[0px_4px_10px_#AEAEC026]">
      {/* Title, preceded on small screens by the drawer trigger */}
      <div className="flex min-w-0 items-center gap-3">
        <Sheet open={showNav} onOpenChange={setShowNav}>
          <SheetTrigger asChild>
            <button
              type="button"
              aria-label="Open navigation"
              className="hidden max-lg:flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shadow-sm"
            >
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>

          {/* A true left drawer: pinned to the edge, full height, sliding in
              from the left — not the floating bottom card the other sheets
              use below sm. */}
          <SheetContent
            side="left"
            mobileBottomSheet={false}
            className="w-[280px] max-w-[85vw] rounded-none border-none bg-sidebar p-0"
          >
            {/* Required for the dialog's accessible name; the rail shows the
                brand logo instead, so it stays visually hidden here. */}
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <ScrollArea className="h-full w-full [&>div>div]:h-full [&>div>div]:w-full">
              <SidebarNav expanded onNavigate={() => setShowNav(false)} />
            </ScrollArea>
          </SheetContent>
        </Sheet>

        <h1 className="text-[18px] font-semibold text-grey-black dark:text-white truncate">
          {pageTitle}
        </h1>
      </div>

      {/* Right cluster */}
      <div className="flex items-center justify-end gap-3 lg:gap-4">
        {/* AI assistant */}
        <button
          type="button"
          onClick={() => setShowAssistant(true)}
          aria-label="Ask the assistant"
          className="relative flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#F8F9FA] dark:bg-muted text-primary hover:bg-gray-100 dark:hover:bg-muted/80 transition-colors cursor-pointer"
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
          className="relative flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#F8F9FA] dark:bg-muted text-grey3 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-muted/80 transition-colors cursor-pointer"
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
          <span className="hidden md:block text-sm font-medium text-grey-black dark:text-white max-w-45 truncate">
            {userName}
          </span>
        ) : null}

        {/* Opens the full profile drawer, matching the vendor app. */}
        <button
          type="button"
          onClick={() => setShowProfile(true)}
          aria-label="Open profile"
          className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-border bg-[#F8F9FA] dark:bg-muted text-grey3 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-muted/80 transition-colors cursor-pointer"
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
            <span className="text-xs font-semibold text-grey-black dark:text-white">
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

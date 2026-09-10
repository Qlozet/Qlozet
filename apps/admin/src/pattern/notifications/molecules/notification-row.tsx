'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowUpRight,
  Bell,
  Check,
  CreditCard,
  Layers,
  Package,
  Scissors,
  Settings,
  ShoppingBag,
  Truck,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { timeAgo } from '@/lib/orders';
import { useMarkNotificationAsViewedMutation } from '@/redux/services/notifications/notifications.api-slice';

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  order: Package,
  shipping: Truck,
  payment: CreditCard,
  bespoke: Scissors,
  product: ShoppingBag,
  team: Users,
  system: Settings,
  fabric_transfer: Truck,
  fabric_transfer_incoming: Layers,
};

const CATEGORY_COLORS: Record<string, string> = {
  order: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  shipping:
    'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
  payment:
    'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  bespoke:
    'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  product: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400',
  team: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400',
  system: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  fabric_transfer:
    'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  fabric_transfer_incoming:
    'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
};

interface NotificationRowProps {
  id: string;
  read: boolean;
  title: string;
  body: string;
  date: string;
  category?: string;
  /** In-app destination (e.g. /disputes). Internal paths only. */
  actionUrl?: string;
}

export const NotificationRow = ({
  id,
  read,
  title,
  body,
  date,
  category,
  actionUrl,
}: NotificationRowProps) => {
  const router = useRouter();
  const [isRead, setIsRead] = useState(read);
  const [markAsViewed, { isLoading: isMarking }] =
    useMarkNotificationAsViewedMutation();

  const markRead = async () => {
    if (isRead) return;
    // Optimistic — reverted if the call fails so the badge stays honest.
    setIsRead(true);
    try {
      await markAsViewed(id).unwrap();
    } catch {
      setIsRead(false);
    }
  };

  // Only same-app paths — an absolute URL in the payload is ignored rather
  // than becoming an open redirect out of the console.
  const destination =
    actionUrl && actionUrl.startsWith('/') && !actionUrl.startsWith('//')
      ? actionUrl
      : null;

  const handleClick = () => {
    markRead();
    if (destination) router.push(destination);
  };

  const Icon = (category && CATEGORY_ICONS[category]) || Bell;
  const colorClass =
    (category && CATEGORY_COLORS[category]) || CATEGORY_COLORS.system;

  return (
    // A div rather than a button: the row is clickable, but it also contains
    // the "Mark as read" button and a button can't nest inside a button.
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleClick();
        }
      }}
      className={cn(
        'group flex w-full items-start gap-3 px-4 py-4 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        destination && 'cursor-pointer',
        !isRead
          ? 'cursor-pointer bg-primary/10 hover:bg-primary/15'
          : 'hover:bg-[#F8F9FA] dark:hover:bg-muted/80'
      )}
    >
      <div
        className={cn(
          'mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg',
          colorClass
        )}
      >
        <Icon className="size-4" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              'text-sm leading-snug text-grey-black dark:text-white',
              !isRead ? 'font-semibold' : 'font-medium'
            )}
          >
            {title}
          </p>
          <span className="flex shrink-0 items-center gap-1.5">
            {destination && (
              <ArrowUpRight className="mt-1 size-3.5 text-grey3 opacity-0 transition-opacity group-hover:opacity-100 dark:text-gray-400" />
            )}
            {!isRead && (
              <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
            )}
          </span>
        </div>

        <p className="mt-0.5 line-clamp-2 text-sm text-grey3 dark:text-gray-400">
          {body}
        </p>

        <div className="mt-1.5 flex items-center justify-between gap-3">
          <p className="text-xs text-grey3 dark:text-gray-400">
            {timeAgo(date)}
          </p>

          {/* Explicit action for unread items — clicking the row does the same
              thing, so this stops propagation to avoid firing twice. */}
          {!isRead && (
            <button
              type="button"
              disabled={isMarking}
              onClick={(event) => {
                event.stopPropagation();
                markRead();
              }}
              className="flex shrink-0 cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10 disabled:opacity-50"
            >
              <Check className="size-3.5" />
              Mark as read
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

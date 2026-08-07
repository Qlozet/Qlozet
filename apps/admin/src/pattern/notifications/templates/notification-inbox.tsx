'use client';

import { useState } from 'react';
import {
  Bell,
  CheckCheck,
  CreditCard,
  Package,
  Scissors,
  Settings,
  ShoppingBag,
  Truck,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAllAsReadMutation,
  type AppNotification,
} from '@/redux/services/notifications/notifications.api-slice';
import { NotificationRow } from '../molecules/notification-row';

const CATEGORIES = [
  { key: undefined, label: 'All', icon: Bell },
  { key: 'order', label: 'Orders', icon: Package },
  { key: 'shipping', label: 'Shipping', icon: Truck },
  { key: 'payment', label: 'Payment', icon: CreditCard },
  { key: 'bespoke', label: 'Bespoke', icon: Scissors },
  { key: 'product', label: 'Products', icon: ShoppingBag },
  { key: 'team', label: 'Team', icon: Users },
  { key: 'system', label: 'System', icon: Settings },
] as const;

const PAGE_SIZE = 20;

export const NotificationInbox = () => {
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching, isError } = useGetNotificationsQuery({
    page,
    limit: PAGE_SIZE,
    category,
  });
  const { data: unreadData } = useGetUnreadCountQuery();
  const [markAllAsRead, { isLoading: isMarkingAll }] =
    useMarkAllAsReadMutation();

  // The list endpoint has returned both an array and a keyed object; normalise.
  const raw: unknown = data?.data;
  const notifications: AppNotification[] = Array.isArray(raw)
    ? (raw as AppNotification[])
    : raw && typeof raw === 'object'
      ? (Object.values(raw) as AppNotification[])
      : [];

  const totalPages = data?.meta?.totalPages ?? 1;
  const unreadCount = unreadData?.data?.total ?? 0;
  const unreadByCategory = unreadData?.data?.byCategory ?? {};

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead().unwrap();
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Could not mark notifications as read. Please try again.');
    }
  };

  const showLoader = isLoading || isFetching;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-grey-black">Inbox</h2>
          {unreadCount > 0 && (
            <span className="rounded-full bg-error px-2.5 py-0.5 text-xs font-medium text-white">
              {unreadCount} unread
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={isMarkingAll}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10 disabled:opacity-50"
          >
            <CheckCheck className="size-4" />
            Mark all read
          </button>
        )}
      </div>

      {/* Category filter */}
      <div className="border-b border-border">
        <div className="-mb-px flex gap-6 overflow-x-auto overflow-y-hidden">
          {CATEGORIES.map((cat) => {
            const isActive = category === cat.key;
            const Icon = cat.icon;
            const badge = cat.key
              ? (unreadByCategory[cat.key] ?? 0)
              : unreadCount;
            return (
              <button
                key={cat.label}
                type="button"
                onClick={() => {
                  setCategory(cat.key);
                  setPage(1);
                }}
                className={cn(
                  'flex shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap border-b-2 px-1 pb-1.5 text-sm transition-colors',
                  isActive
                    ? 'border-primary font-semibold text-primary'
                    : 'border-transparent text-grey3 hover:text-grey-black'
                )}
              >
                <Icon className="size-3.5" />
                {cat.label}
                {badge > 0 && (
                  <span className="ml-1 rounded-full bg-error px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* List */}
      <div className="overflow-hidden rounded-xl border border-border bg-white custom-card-shadow">
        {showLoader ? (
          <div className="divide-y divide-border">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-start gap-3 p-4">
                <Skeleton className="mt-0.5 size-9 shrink-0 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Bell className="mb-3 size-10 text-grey2" />
            <p className="text-sm font-medium text-destructive">
              Error loading notifications
            </p>
            <p className="mt-1 text-xs text-grey3">Please try again later.</p>
          </div>
        ) : notifications.length > 0 ? (
          <div className="divide-y divide-border">
            {notifications.map((item, index) => (
              <NotificationRow
                key={item._id || item.id || index}
                id={item._id || item.id || ''}
                read={item.is_read}
                title={item.title}
                body={item.body}
                date={item.createdAt}
                category={item.category}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Bell className="mb-3 size-10 text-grey2" />
            <p className="text-sm font-medium text-grey-black">
              No notifications
            </p>
            <p className="mt-1 text-xs text-grey3">
              {category
                ? `No ${category} notifications yet.`
                : "You're all caught up."}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page <= 1}
            className="cursor-pointer rounded-lg border border-input px-3 py-1.5 text-sm font-medium text-grey-black transition-colors hover:bg-[#F8F9FA] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-grey3">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page >= totalPages}
            className="cursor-pointer rounded-lg border border-input px-3 py-1.5 text-sm font-medium text-grey-black transition-colors hover:bg-[#F8F9FA] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

'use client';
import React, { useState } from 'react';
import {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAllAsReadMutation,
} from '@/redux/services/notifications/notifications.api-slice';
import Notification from '@/components/Notification/NotificationComponent';
import { Skeleton } from '@/components/ui/skeleton';
import { Bell, CheckCheck, Package, Truck, CreditCard, Scissors, ShoppingBag, Users, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

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

const NotificationPage: React.FC = () => {
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);

  const {
    data: notificationsResponse,
    isLoading,
    error,
  } = useGetNotificationsQuery({ page, limit: 20, category });

  const { data: unreadData } = useGetUnreadCountQuery();
  const [markAllAsRead, { isLoading: isMarkingAll }] = useMarkAllAsReadMutation();

  const notifications = notificationsResponse?.data || [];
  const meta = (notificationsResponse as any)?.meta;
  const totalPages = meta?.totalPages ?? 1;
  const unreadCount = unreadData?.data?.total ?? 0;
  const unreadByCategory = unreadData?.data?.byCategory ?? {};

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead().unwrap();
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  return (
    <section className="py-4 px-0 md:px-4 max-w-none md:max-w-4xl md:mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-foreground">Notifications</h1>
          {unreadCount > 0 && (
            <span className="rounded-full bg-destructive px-2.5 py-0.5 text-xs font-medium text-white">
              {unreadCount} unread
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={isMarkingAll}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
          >
            <CheckCheck className="size-4" />
            Mark all read
          </button>
        )}
      </div>

      {/* Category filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-none mb-2">
        {CATEGORIES.map((cat) => {
          const isActive = category === cat.key;
          const Icon = cat.icon;
          const badge = cat.key ? (unreadByCategory[cat.key] ?? 0) : unreadCount;
          return (
            <button
              key={cat.label}
              type="button"
              onClick={() => { setCategory(cat.key); setPage(1); }}
              className={cn(
                'flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors shrink-0',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-accent dark:bg-muted text-foreground hover:bg-primary/10'
              )}
            >
              <Icon className="size-3.5" />
              {cat.label}
              {badge > 0 && (
                <span className={cn(
                  'ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none',
                  isActive ? 'bg-white/20 text-white' : 'bg-destructive text-white'
                )}>
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Notification list */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-border">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 p-4">
                <Skeleton className="size-3 rounded-full mt-1.5 shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Bell className="size-10 text-muted-foreground mb-3" />
            <p className="text-sm text-destructive font-medium">Error loading notifications</p>
            <p className="text-xs text-muted-foreground mt-1">Please try again later</p>
          </div>
        ) : notifications.length > 0 ? (
          <div className="divide-y divide-border">
            {notifications.map((item, index) => (
              <Notification
                key={item._id || item.id || index}
                id={item._id || item.id || ""}
                read={item.is_read}
                title={item.title}
                desc={item.body}
                date={item.createdAt}
                category={item.category}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Bell className="size-10 text-muted-foreground mb-3" />
            <p className="text-sm font-medium text-foreground">No notifications</p>
            <p className="text-xs text-muted-foreground mt-1">
              {category ? `No ${category} notifications yet` : "You're all caught up!"}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded-lg border border-input px-3 py-1.5 text-sm font-medium text-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="rounded-lg border border-input px-3 py-1.5 text-sm font-medium text-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
};

export default NotificationPage;

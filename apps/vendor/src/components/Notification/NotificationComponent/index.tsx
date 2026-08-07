import { useState } from 'react';
import { useMarkNotificationAsViewedMutation } from '@/redux/services/notifications/notifications.api-slice';
import {
  Package,
  Truck,
  CreditCard,
  Scissors,
  ShoppingBag,
  Users,
  Settings,
  Bell,
  Layers,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface NotificationProps {
  id: string;
  read: boolean;
  title: string;
  desc: string;
  date: string;
  category?: string;
}

const Notification = ({
  id,
  read,
  title,
  desc,
  date,
  category,
}: NotificationProps) => {
  const [isRead, setIsRead] = useState(read);
  const [markAsViewed, { isLoading: isMarking }] =
    useMarkNotificationAsViewedMutation();

  const markRead = async () => {
    if (isRead) return;
    try {
      setIsRead(true);
      await markAsViewed(id).unwrap();
    } catch (error) {
      console.error('Error marking notification as viewed:', error);
      setIsRead(false);
    }
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
      onClick={markRead}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          markRead();
        }
      }}
      className={cn(
        'flex items-start gap-3 w-full text-left px-4 py-4 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        !isRead
          ? 'cursor-pointer bg-primary/10 dark:bg-primary/15 hover:bg-primary/15 dark:hover:bg-primary/20'
          : 'hover:bg-accent dark:hover:bg-muted/50'
      )}
    >
      {/* Category icon */}
      <div
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-lg mt-0.5',
          colorClass
        )}
      >
        <Icon className="size-4" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              'text-sm text-foreground leading-snug',
              !isRead ? 'font-semibold' : 'font-medium'
            )}
          >
            {title}
          </p>
          {!isRead && (
            <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
          {desc}
        </p>

        <div className="mt-1.5 flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">{timeAgo(date)}</p>

          {/* Explicit action for unread items — clicking the row does the same
              thing, so this stops propagation to avoid firing twice. */}
          {!isRead && (
            <button
              type="button"
              disabled={isMarking}
              onClick={(e) => {
                e.stopPropagation();
                markRead();
              }}
              className="flex shrink-0 cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10 disabled:opacity-50 dark:text-white"
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

export default Notification;

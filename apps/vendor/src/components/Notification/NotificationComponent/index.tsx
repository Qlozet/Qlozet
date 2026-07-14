import { useState } from 'react';
import { useMarkNotificationAsViewedMutation } from '@/redux/services/notifications/notifications.api-slice';
import { Package, Truck, CreditCard, Scissors, ShoppingBag, Users, Settings, Bell, Layers } from 'lucide-react';
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
  shipping: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
  payment: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  bespoke: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  product: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400',
  team: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400',
  system: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  fabric_transfer: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  fabric_transfer_incoming: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
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

const Notification = ({ id, read, title, desc, date, category }: NotificationProps) => {
  const [isRead, setIsRead] = useState(read);
  const [markAsViewed] = useMarkNotificationAsViewedMutation();

  const handleClick = async () => {
    if (!isRead) {
      try {
        setIsRead(true);
        await markAsViewed(id).unwrap();
      } catch (error) {
        console.error('Error marking notification as viewed:', error);
        setIsRead(false);
      }
    }
  };

  const Icon = (category && CATEGORY_ICONS[category]) || Bell;
  const colorClass = (category && CATEGORY_COLORS[category]) || CATEGORY_COLORS.system;

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'flex items-start gap-3 w-full text-left px-4 py-4 transition-colors',
        !isRead
          ? 'bg-primary/5 dark:bg-primary/10 hover:bg-primary/10 dark:hover:bg-primary/15'
          : 'hover:bg-accent dark:hover:bg-muted/50'
      )}
    >
      {/* Category icon */}
      <div className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg mt-0.5', colorClass)}>
        <Icon className="size-4" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn(
            'text-sm text-foreground leading-snug',
            !isRead ? 'font-semibold' : 'font-medium'
          )}>
            {title}
          </p>
          {!isRead && (
            <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
          {desc}
        </p>
        <p className="text-xs text-muted-foreground mt-1.5">
          {timeAgo(date)}
        </p>
      </div>
    </button>
  );
};

export default Notification;

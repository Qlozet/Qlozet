'use client';

import { cn } from '@/lib/utils';
import {
  CHANNEL_LABELS,
  type NotificationChannel,
} from '../data/notification-catalog';

interface ChannelTabsProps {
  value: NotificationChannel;
  onChange: (value: NotificationChannel) => void;
}

const CHANNELS: NotificationChannel[] = ['push', 'email'];

// Segmented "Push Notifications / Email Notification" tab control.
export const ChannelTabs = ({ value, onChange }: ChannelTabsProps) => {
  return (
    <div className="inline-flex rounded-xl bg-[#F8F9FA] p-1">
      {CHANNELS.map((channel) => {
        const active = channel === value;
        return (
          <button
            key={channel}
            type="button"
            onClick={() => onChange(channel)}
            className={cn(
              'rounded-lg px-5 py-2.5 text-sm font-medium transition-colors cursor-pointer',
              active
                ? 'bg-primary text-primary-foreground'
                : 'text-grey3 hover:text-grey-black'
            )}
          >
            {CHANNEL_LABELS[channel]}
          </button>
        );
      })}
    </div>
  );
};

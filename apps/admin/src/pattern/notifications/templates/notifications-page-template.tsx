'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { NotificationInbox } from './notification-inbox';
import { NotificationsTemplate } from './notifications-template';

type NotificationsTab = 'inbox' | 'settings';

const TABS: { label: string; value: NotificationsTab }[] = [
  { label: 'Inbox', value: 'inbox' },
  { label: 'Settings', value: 'settings' },
];

/**
 * Notifications has two distinct jobs: reading the notifications addressed to
 * you (Inbox, backed by /notifications) and configuring which notifications the
 * platform sends (Settings). They're tabbed rather than split across routes so
 * the top bar's bell has a single destination — matching the Support page.
 */
export const NotificationsPageTemplate = () => {
  const [tab, setTab] = useState<NotificationsTab>('inbox');

  return (
    <div className="w-full min-h-screen h-fit space-y-6 pb-10">
      <div className="inline-flex rounded-xl bg-[#F8F9FA] p-1">
        {TABS.map((item) => {
          const active = item.value === tab;
          return (
            <button
              key={item.value}
              type="button"
              onClick={() => setTab(item.value)}
              className={cn(
                'cursor-pointer rounded-lg px-5 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-grey3 hover:text-grey-black'
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {tab === 'inbox' ? <NotificationInbox /> : <NotificationsTemplate />}
    </div>
  );
};

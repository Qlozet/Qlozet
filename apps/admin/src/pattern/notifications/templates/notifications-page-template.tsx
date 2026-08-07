'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NotificationInbox } from './notification-inbox';
import { NotificationsTemplate } from './notifications-template';

const TABS = [
  { value: 'inbox', label: 'Inbox' },
  { value: 'settings', label: 'Settings' },
];

/**
 * Notifications has two distinct jobs: reading the notifications addressed to
 * you (Inbox, backed by /notifications) and configuring which notifications the
 * platform sends (Settings). They're tabbed rather than split across routes so
 * the top bar's bell has a single destination.
 */
export const NotificationsPageTemplate = () => {
  return (
    <div className="w-full min-h-screen h-fit pb-10">
      <Tabs defaultValue="inbox" className="space-y-6">
        {/* Card-background tab bar; active tab uses the theme's primary colour.
            Matches the vendor Orders page bar exactly. */}
        <TabsList className="h-12 gap-1 rounded-2xl border border-border bg-card p-1.5 custom-card-shadow">
          {TABS.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="rounded-xl px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="inbox" className="space-y-6">
          <NotificationInbox />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <NotificationsTemplate />
        </TabsContent>
      </Tabs>
    </div>
  );
};

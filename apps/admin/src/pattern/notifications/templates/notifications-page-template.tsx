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
        {/* Segmented pill switch — same treatment as the Support page tabs. */}
        <TabsList className="h-auto rounded-xl bg-[#F8F9FA] dark:bg-muted p-1">
          {TABS.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="rounded-lg px-5 py-2.5 text-sm font-medium text-grey3 dark:text-gray-400 hover:text-grey-black dark:hover:text-white data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none"
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

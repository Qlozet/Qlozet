'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NotificationInbox } from './notification-inbox';
import { BroadcastsTemplate } from './broadcasts-template';

const TABS = [
  { value: 'inbox', label: 'Inbox' },
  { value: 'announcements', label: 'Announcements' },
];

/**
 * Notifications has two jobs: reading the notifications addressed to you
 * (Inbox, backed by /notifications) and telling a whole audience something
 * (Announcements). Tabbed rather than split across routes so the top bar's
 * bell has a single destination.
 *
 * The second tab used to be "Settings": a grid of per-type, per-channel
 * toggles. It persisted nothing — every switch and every edit toasted success
 * and reverted on refresh — and there were no endpoints behind it. It was also
 * the wrong idea. A shipping notice is an obligation to the customer, not an
 * admin preference, and the toggles that would make sense (marketing opt-outs)
 * belong to the recipient. What was actually missing was the opposite of a
 * mute switch, which is what this tab is now.
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

        <TabsContent value="announcements" className="space-y-6">
          <BroadcastsTemplate />
        </TabsContent>
      </Tabs>
    </div>
  );
};

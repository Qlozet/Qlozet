'use client';

import { useMemo, useState } from 'react';
import NiceModal from '@ebay/nice-modal-react';
import { CirclePlus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChannelTabs } from '../molecules/channel-tabs';
import { NotificationCard } from '../molecules/notification-card';
import {
  TargetFilter,
  type TargetFilterValue,
} from '../molecules/target-filter';
import { AddNotificationModal } from '../organisms/add-notification-modal';
import { EditTargetModal } from '../organisms/edit-target-modal';
import {
  NOTIFICATION_CATALOG,
  TRIGGER_OPTIONS,
  type NotificationChannel,
  type NotificationDraft,
  type NotificationSetting,
  type NotificationTarget,
} from '../data/notification-catalog';

const triggerLabel = (value: NotificationDraft['trigger']) =>
  TRIGGER_OPTIONS.find((o) => o.value === value)?.label ?? 'Manual';

// Short card subtitle for an admin-composed notification.
const draftDescription = (draft: NotificationDraft): string => {
  if (draft.trigger === 'scheduled' && draft.date) {
    return `Scheduled (${draft.date}${draft.time ? ` ${draft.time}` : ''})`;
  }
  return triggerLabel(draft.trigger);
};

export const NotificationsTemplate = () => {
  // TODO(api): seed from `useGetNotificationSettingsQuery()` once the backend
  // exposes notification settings; merge live values over NOTIFICATION_CATALOG.
  const [settings, setSettings] =
    useState<NotificationSetting[]>(NOTIFICATION_CATALOG);
  const [channel, setChannel] = useState<NotificationChannel>('email');
  const [targetFilter, setTargetFilter] = useState<TargetFilterValue>('');
  const [search, setSearch] = useState('');

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    return settings.filter((s) => {
      const matchesTarget = !targetFilter || s.target === targetFilter;
      const matchesSearch =
        !query ||
        s.title.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query);
      return matchesTarget && matchesSearch;
    });
  }, [settings, targetFilter, search]);

  const handleToggle = (key: string, enabled: boolean) => {
    // TODO(api): PATCH the notification's enabled-state for this channel.
    setSettings((prev) =>
      prev.map((s) =>
        s.key === key
          ? { ...s, enabled: { ...s.enabled, [channel]: enabled } }
          : s
      )
    );
  };

  const handleEditTarget = async (key: string) => {
    const setting = settings.find((s) => s.key === key);
    if (!setting) return;

    const next = (await NiceModal.show(EditTargetModal, {
      title: setting.title,
      current: setting.target,
    })) as NotificationTarget | undefined;

    if (!next || next === setting.target) return;

    // TODO(api): PATCH the notification's target.
    setSettings((prev) =>
      prev.map((s) => (s.key === key ? { ...s, target: next } : s))
    );
    toast.success('Target updated');
  };

  const handleAdd = async () => {
    const draft = (await NiceModal.show(AddNotificationModal)) as
      | NotificationDraft
      | undefined;
    if (!draft) return;

    // TODO(api): replace this optimistic append with the create-notification
    // response once the endpoint exists.
    const created: NotificationSetting = {
      key: `custom_${settings.length + 1}_${draft.subject
        .toLowerCase()
        .replace(/\s+/g, '_')}`,
      title: draft.subject,
      description: draftDescription(draft),
      target: draft.audience,
      enabled: { email: true, push: true },
      custom: true,
    };
    setSettings((prev) => [...prev, created]);
    toast.success('Notification created');
  };

  return (
    <div className="w-full min-h-screen h-fit space-y-6 pb-10">
      {/* Header action */}
      <div className="flex items-center justify-end">
        <Button onClick={handleAdd} className="gap-2">
          <CirclePlus className="size-4" />
          Add Notifications
        </Button>
      </div>

      {/* Settings panel */}
      <div className="rounded-2xl bg-white p-5 shadow-[0px_4px_10px_#AEAEC026] lg:p-6">
        {/* Toolbar: tabs + filter + search */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <ChannelTabs value={channel} onChange={setChannel} />

          <div className="flex flex-wrap items-center gap-3">
            <TargetFilter value={targetFilter} onChange={setTargetFilter} />

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search"
                className="h-10 w-full pl-9 sm:w-[240px]"
              />
            </div>
          </div>
        </div>

        {/* Cards */}
        {visible.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {visible.map((setting) => (
              <NotificationCard
                key={setting.key}
                setting={setting}
                channel={channel}
                onToggle={handleToggle}
                onEditTarget={handleEditTarget}
              />
            ))}
          </div>
        ) : (
          <div className="mt-6 flex min-h-[240px] flex-col items-center justify-center rounded-2xl bg-[#F8F9FA] text-center">
            <p className="text-sm font-medium text-grey-black">
              No notifications found
            </p>
            <p className="mt-1 text-sm text-grey3">
              {search || targetFilter
                ? 'Try adjusting your search or target filter.'
                : 'Add a notification to get started.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

'use client';

import { CheckCircle2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import {
  TARGET_LABELS,
  type NotificationChannel,
  type NotificationSetting,
} from '../data/notification-catalog';

interface NotificationCardProps {
  setting: NotificationSetting;
  /** The channel tab currently being viewed (push | email). */
  channel: NotificationChannel;
  onToggle: (key: string, enabled: boolean) => void;
  onEditTarget: (key: string) => void;
}

// Single notification-type card: title, description, channel toggle and a
// target row with an inline "Edit" action.
export const NotificationCard = ({
  setting,
  channel,
  onToggle,
  onEditTarget,
}: NotificationCardProps) => {
  const enabled = setting.enabled[channel];

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-[#F8F9FA] p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-grey-black">
            {setting.title}
          </h3>
          <p className="text-sm text-grey3">{setting.description}</p>
        </div>

        <Switch
          checked={enabled}
          onCheckedChange={(value) => onToggle(setting.key, value)}
          aria-label={`Toggle ${setting.title}`}
        />
      </div>

      {/* Target row */}
      <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2.5">
        <CheckCircle2 className="size-4 shrink-0 text-primary" />
        <span className="text-sm text-grey3">Target:</span>
        <span className="font-mono text-xs text-grey-black">
          {TARGET_LABELS[setting.target]}
        </span>
        <button
          type="button"
          onClick={() => onEditTarget(setting.key)}
          className="ml-auto text-sm font-medium text-grey-black underline underline-offset-2 hover:text-primary transition-colors cursor-pointer"
        >
          Edit
        </button>
      </div>
    </div>
  );
};

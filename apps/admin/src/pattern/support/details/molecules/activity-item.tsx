import type { TicketActivity } from '../lib/activity-types';

const initials = (name: string): string =>
  name
    .replace(/^@/, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || '?';

// A single row in the ticket activity timeline: date column + avatar + actor +
// action, with optional highlighted note and image attachments.
export const ActivityItem = ({ activity }: { activity: TicketActivity }) => (
  <div className="flex gap-3 sm:gap-4">
    {/* Date column — desktop only; on mobile the 140px column would squeeze
        the content into a sliver, so the time moves next to the actor. */}
    <span className="hidden w-[140px] shrink-0 pt-1 text-xs text-grey2 dark:text-gray-400 sm:block">
      {activity.time}
    </span>

    {/* Avatar */}
    {activity.avatarUrl ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={activity.avatarUrl}
        alt={activity.actor}
        className="size-8 shrink-0 rounded-full object-cover"
      />
    ) : (
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brown3 text-[11px] font-semibold text-white">
        {initials(activity.actor)}
      </div>
    )}

    {/* Body */}
    <div className="min-w-0 flex-1 space-y-1 pb-2">
      <div className="flex items-baseline justify-between gap-2">
        <p className="truncate text-sm font-semibold text-[#3387CC]">
          {activity.actor}
        </p>
        <span className="shrink-0 text-[11px] text-grey2 dark:text-gray-400 sm:hidden">
          {activity.time}
        </span>
      </div>
      <p className="break-words text-sm text-grey-black dark:text-white">
        {activity.action}
        {activity.highlight && (
          <span className="text-[#3387CC]"> {activity.highlight}</span>
        )}
      </p>

      {activity.attachments && activity.attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {activity.attachments.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={src}
              alt={`Attachment ${i + 1}`}
              className="size-16 rounded-lg object-cover"
            />
          ))}
        </div>
      )}
    </div>
  </div>
);

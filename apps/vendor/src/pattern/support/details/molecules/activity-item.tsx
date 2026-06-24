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
  <div className='flex gap-4'>
    {/* Date column */}
    <span className='w-[140px] shrink-0 pt-1 text-xs text-grey2'>
      {activity.time}
    </span>

    {/* Avatar */}
    {activity.avatarUrl ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={activity.avatarUrl}
        alt={activity.actor}
        className='size-8 shrink-0 rounded-full object-cover'
      />
    ) : (
      <div className='flex size-8 shrink-0 items-center justify-center rounded-full bg-brown3 text-[11px] font-semibold text-white'>
        {initials(activity.actor)}
      </div>
    )}

    {/* Body */}
    <div className='flex-1 space-y-1 pb-2'>
      <p className='text-sm font-semibold text-[#3387CC]'>{activity.actor}</p>
      <p className='text-sm text-grey-black'>
        {activity.action}
        {activity.highlight && (
          <span className='text-[#3387CC]'> {activity.highlight}</span>
        )}
      </p>

      {activity.attachments && activity.attachments.length > 0 && (
        <div className='flex flex-wrap gap-2 pt-1'>
          {activity.attachments.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={src}
              alt={`Attachment ${i + 1}`}
              className='size-16 rounded-lg object-cover'
            />
          ))}
        </div>
      )}
    </div>
  </div>
);

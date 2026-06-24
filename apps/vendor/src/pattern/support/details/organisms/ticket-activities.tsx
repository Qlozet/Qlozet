'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { TableToolbar } from '@/pattern/common/molecules/table-toolbar';
import { ActivityItem } from '../molecules/activity-item';
import type { TicketActivity } from '../lib/activity-types';

// Ticket activity timeline.
export const TicketActivities = () => {
  const [search, setSearch] = useState('');
  const comingSoon = () => toast.info('This action is coming soon.');

  // TODO(api): the backend has no ticket-activity endpoint yet. Replace with
  // `useGetTicketActivitiesQuery(ticketId)` once it ships; the timeline +
  // ActivityItem rendering are ready.
  const activities: TicketActivity[] = [];

  return (
    <div className='overflow-hidden rounded-xl border border-border bg-white custom-card-shadow'>
      <TableToolbar
        title='Activities'
        search={search}
        onSearchChange={setSearch}
        onFilterDate={comingSoon}
        onExport={comingSoon}
      />

      <div className='px-6 pb-6'>
        {activities.length > 0 ? (
          <div className='space-y-4'>
            {activities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        ) : (
          <div className='flex min-h-[160px] items-center justify-center text-center text-sm text-grey3'>
            No activity recorded for this ticket yet.
          </div>
        )}
      </div>
    </div>
  );
};

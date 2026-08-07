'use client';

import { useMemo, useState } from 'react';
import { TableToolbar } from '@/pattern/common/molecules/table-toolbar';
import { ActivityItem } from '../molecules/activity-item';
import type { TicketActivity } from '../lib/activity-types';

// Ticket activity timeline.
//
// TODO(api): the backend has no ticket-activity endpoint. Replace `activities`
// with `useGetTicketActivitiesQuery(ticketId)` once it ships — the timeline and
// ActivityItem rendering below are already built against TicketActivity.
export const TicketActivities = () => {
  const [search, setSearch] = useState('');

  const activities: TicketActivity[] = useMemo(() => [], []);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return activities;
    return activities.filter((activity) =>
      `${activity.actor} ${activity.action} ${activity.highlight ?? ''}`
        .toLowerCase()
        .includes(term)
    );
  }, [activities, search]);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white custom-card-shadow">
      {/* No date filter or export: there is no activity data source to act on. */}
      <TableToolbar
        title="Activities"
        search={search}
        onSearchChange={setSearch}
        showFilter={false}
        showExport={false}
      />

      <div className="px-6 pb-6">
        {visible.length > 0 ? (
          <div className="space-y-4">
            {visible.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        ) : (
          <div className="flex min-h-40 items-center justify-center text-center text-sm text-grey3">
            {activities.length === 0
              ? 'No activity recorded for this ticket yet.'
              : 'No activity matches your search.'}
          </div>
        )}
      </div>
    </div>
  );
};

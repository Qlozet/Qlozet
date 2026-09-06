'use client';

import { useMemo, useState } from 'react';
import { Loader2, StickyNote } from 'lucide-react';
import { toast } from 'sonner';
import { TableToolbar } from '@/pattern/common/molecules/table-toolbar';
import {
  useGetTicketActivitiesQuery,
  useAddTicketNoteMutation,
  type TicketActivityRow,
} from '@/redux/services/tickets/tickets.api-slice';
import { ActivityItem } from '../molecules/activity-item';
import type { TicketActivity } from '../lib/activity-types';

// Ticket activity timeline — GET /admin/tickets/:id/activities.
// The backend stores an append-only audit log (created / replied / assigned /
// status changes / internal notes) and synthesizes a baseline for tickets that
// predate it, so every ticket renders a coherent history.

const formatTime = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const date = d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const time = d
    .toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    .toLowerCase()
    .replace(' ', '');
  return `${date} . ${time}`;
};

const truncate = (s: string, n = 140) =>
  s.length > n ? `${s.slice(0, n - 1)}…` : s;

/** Map a backend audit row onto the timeline component's display shape. */
const toDisplay = (row: TicketActivityRow): TicketActivity => {
  const actor =
    row.actor?.full_name || row.actor_label || row.actor?.email || 'System';
  const base: TicketActivity = {
    id: row._id,
    actor,
    action: row.description,
    time: formatTime(row.createdAt),
  };

  switch (row.type) {
    case 'replied':
      return { ...base, action: `Replied: “${truncate(row.description)}”` };
    case 'note_added':
      return {
        ...base,
        action: 'Added internal note:',
        highlight: `“${truncate(row.description)}”`,
      };
    case 'assigned':
      return row.metadata?.assignee_name
        ? {
            ...base,
            action: 'Reassigned ticket to:',
            highlight: row.metadata.assignee_name,
          }
        : base;
    case 'attachment_added':
      return { ...base, attachments: row.metadata?.attachments };
    default:
      return base;
  }
};

export const TicketActivities = ({ ticketId }: { ticketId: string }) => {
  const [search, setSearch] = useState('');
  const [note, setNote] = useState('');

  const { data, isLoading, isError } = useGetTicketActivitiesQuery(ticketId, {
    skip: !ticketId,
  });
  const [addNote, { isLoading: savingNote }] = useAddTicketNoteMutation();

  const activities: TicketActivity[] = useMemo(
    () => (data?.data ?? []).map(toDisplay),
    [data]
  );

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return activities;
    return activities.filter((activity) =>
      `${activity.actor} ${activity.action} ${activity.highlight ?? ''}`
        .toLowerCase()
        .includes(term)
    );
  }, [activities, search]);

  const submitNote = async () => {
    const body = note.trim();
    if (!body) return;
    try {
      await addNote({ id: ticketId, body }).unwrap();
      setNote('');
      toast.success('Internal note added');
    } catch {
      toast.error('Could not add the note.');
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white dark:bg-card custom-card-shadow">
      <TableToolbar
        title="Activities"
        search={search}
        onSearchChange={setSearch}
        showFilter={false}
        showExport={false}
      />

      <div className="px-6 pb-6">
        {/* Internal note composer — notes live only in this timeline. */}
        <div className="mb-5 flex items-center gap-2">
          <StickyNote className="size-4 shrink-0 text-grey3 dark:text-gray-400" />
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submitNote();
            }}
            placeholder="Add an internal note — visible to admins only…"
            className="h-9 flex-1 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none placeholder:text-gray-400 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200"
          />
          <button
            type="button"
            onClick={submitNote}
            disabled={savingNote || !note.trim()}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {savingNote && <Loader2 className="size-3.5 animate-spin" />}
            Add note
          </button>
        </div>

        {isLoading ? (
          <div className="flex min-h-40 items-center justify-center text-sm text-grey3 dark:text-gray-400">
            <Loader2 className="mr-2 size-4 animate-spin" /> Loading activity…
          </div>
        ) : isError ? (
          <div className="flex min-h-40 items-center justify-center text-center text-sm text-grey3 dark:text-gray-400">
            Could not load this ticket’s activity.
          </div>
        ) : visible.length > 0 ? (
          <div className="space-y-4">
            {visible.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        ) : (
          <div className="flex min-h-40 items-center justify-center text-center text-sm text-grey3 dark:text-gray-400">
            {activities.length === 0
              ? 'No activity recorded for this ticket yet.'
              : 'No activity matches your search.'}
          </div>
        )}
      </div>
    </div>
  );
};

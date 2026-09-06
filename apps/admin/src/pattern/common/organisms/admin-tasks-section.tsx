'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { RefreshCw } from 'lucide-react';
import { APP_ROUTES } from '@/lib/routes';
import { Skeleton } from '@/components/ui/skeleton';
import { timeAgo } from '@/lib/orders';
import type { AdminProfileTask } from '@/redux/services/dashboard/dashboard.api-slice';

type Filter = 'all' | 'completed' | 'pending';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'completed', label: 'Completed' },
  { key: 'pending', label: 'Pending' },
];

interface AdminTasksSectionProps {
  tasks?: AdminProfileTask[];
  /** How far back the list looks, so the heading matches what the API sent. */
  windowDays?: number;
  isLoading: boolean;
  isFetching: boolean;
  onRefresh: () => void;
}

/**
 * The design's "Task Last Month" panel.
 *
 * A "task" is a support ticket assigned to this admin: the backend has no task
 * or audit-log collection, and tickets are the only work the platform actually
 * assigns — they carry an assignee, a vendor, and a status that maps onto the
 * Completed / Pending tabs.
 */
export const AdminTasksSection = ({
  tasks,
  windowDays,
  isLoading,
  isFetching,
  onRefresh,
}: AdminTasksSectionProps) => {
  const [filter, setFilter] = useState<Filter>('all');

  const visible = useMemo(
    () =>
      filter === 'all'
        ? (tasks ?? [])
        : (tasks ?? []).filter((task) => task.status === filter),
    [tasks, filter]
  );

  // The list is the admin's CURRENT assigned work: every still-open ticket
  // (no time window) plus what they completed recently — so the old
  // "Task Last Month" label would under-promise what it shows.
  const heading = 'My Tickets';
  void windowDays;

  return (
    <div className="overflow-hidden rounded-[20px] bg-[hsla(0,0%,96%,1)] dark:bg-muted">
      <div className="flex items-center justify-between border-b border-[#DDE2E5] dark:border-white/10 px-5 py-4">
        <span className="text-[15px] font-semibold text-[#1C1C1E] dark:text-white">
          {heading}
        </span>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isFetching}
          aria-label="Refresh tasks"
          className="text-[#1C1C1E] dark:text-white transition-opacity hover:opacity-60 disabled:opacity-40"
        >
          <RefreshCw className={`size-4 ${isFetching ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div
        role="tablist"
        aria-label="Filter tasks"
        className="flex items-center gap-5 px-5 py-3.5"
      >
        {FILTERS.map(({ key, label }) => {
          const active = filter === key;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(key)}
              className={`flex items-center gap-1.5 text-[13px] transition-colors ${
                active
                  ? 'font-semibold text-[#1C1C1E] dark:text-white'
                  : 'text-[#8E8E93] dark:text-gray-400 hover:text-[#3A3A3C] dark:hover:text-gray-200'
              }`}
            >
              <span
                aria-hidden
                className={`size-1.5 rounded-full ${
                  active ? 'bg-[#34C759]' : 'bg-[#C7C7CC] dark:bg-gray-600'
                }`}
              />
              {label}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="space-y-3 px-5 pb-5">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-4/5" />
          <Skeleton className="h-5 w-3/5" />
        </div>
      ) : visible.length === 0 ? (
        <p className="px-5 pb-6 pt-2 text-center text-[13px] text-[#8E8E93] dark:text-gray-400">
          {(tasks ?? []).length === 0
            ? 'No tickets have been assigned to you recently.'
            : `No ${filter} tasks in this period.`}
        </p>
      ) : (
        <ul className="divide-y divide-[#DDE2E5] dark:divide-white/10 border-t border-[#DDE2E5] dark:border-white/10">
          {visible.map((task) => (
            <li key={task.id}>
              {/* A task IS a ticket — the row opens it. */}
              <Link
                href={`${APP_ROUTES.support}/${task.id}`}
                className="flex items-start justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
              >
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-medium text-[#1C1C1E] dark:text-white">
                    {task.title}
                  </p>
                  {task.vendor && (
                    <p className="mt-0.5 truncate text-[12px] text-[#8E8E93] dark:text-gray-400">
                      {task.vendor}
                    </p>
                  )}
                </div>
                <span className="shrink-0 whitespace-nowrap text-[12px] text-[#8E8E93] dark:text-gray-400">
                  {timeAgo(task.at)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

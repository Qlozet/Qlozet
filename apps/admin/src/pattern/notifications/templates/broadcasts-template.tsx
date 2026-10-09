'use client';

import NiceModal from '@ebay/nice-modal-react';
import {
  AlertTriangle,
  CalendarClock,
  CirclePlus,
  Loader2,
  Mail,
  Megaphone,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ComposeAnnouncementDrawer } from '../organisms/compose-announcement-drawer';
import {
  useCancelBroadcastMutation,
  useGetBroadcastsQuery,
  type Broadcast,
  type BroadcastStatus,
} from '@/redux/services/notifications/notifications.api-slice';

const AUDIENCE_LABEL: Record<Broadcast['audience'], string> = {
  customers: 'All customers',
  vendors: 'All vendors',
  admins: 'Admins',
};

// Status colours are semantic and separate from the brand accent: these say
// what state a send is in, not which product this is.
const STATUS_STYLE: Record<BroadcastStatus, { label: string; cls: string }> = {
  scheduled: {
    label: 'Scheduled',
    cls: 'bg-[#FEF6E7] text-[#B25E09] dark:bg-[#B25E09]/15 dark:text-[#E8B964]',
  },
  sending: {
    label: 'Sending',
    cls: 'bg-[#E7F0FE] text-[#1D4ED8] dark:bg-[#1D4ED8]/15 dark:text-[#9DBAF5]',
  },
  sent: {
    label: 'Sent',
    cls: 'bg-[#E7F6EC] text-[#0F973D] dark:bg-[#0F973D]/15 dark:text-[#7FD79F]',
  },
  failed: {
    label: 'Failed',
    cls: 'bg-[#FBEAE9] text-[#A8321E] dark:bg-[#A8321E]/15 dark:text-[#EFA197]',
  },
  cancelled: {
    label: 'Cancelled',
    cls: 'bg-muted text-grey2 dark:text-gray-400',
  },
};

const fmtDate = (iso?: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Announcement history and the composer.
 *
 * The send runs in the background, so a row's counters move on refetch rather
 * than live — which is also why the counters are shown at all. An admin who
 * has just mailed every customer should be able to see how that went.
 */
export const BroadcastsTemplate = () => {
  const { data, isLoading, isError, refetch, isFetching } =
    useGetBroadcastsQuery({ page: 1, limit: 20 });
  const [cancelBroadcast, { isLoading: isCancelling }] =
    useCancelBroadcastMutation();

  const rows = data?.rows ?? [];

  const handleCancel = async (id: string) => {
    try {
      await cancelBroadcast(id).unwrap();
      toast.success('Announcement cancelled');
    } catch (err) {
      const msg = (err as { data?: { message?: string | string[] } })?.data
        ?.message;
      toast.error(
        (Array.isArray(msg) ? msg[0] : msg) || 'Could not cancel it.'
      );
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header card — same rhythm as the other admin section headers. */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-white p-5 dark:bg-card sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="flex items-center gap-2 text-base font-semibold text-grey-black dark:text-white">
            <Megaphone className="size-4 text-primary" />
            Announcements
          </h2>
          <p className="max-w-[62ch] text-sm text-grey2 dark:text-gray-400">
            A message to everyone in one audience, in their notifications and
            optionally by email. There is no unsubscribe, so keep these to
            things people need to know.
          </p>
        </div>
        <Button
          className="shrink-0"
          onClick={() => NiceModal.show(ComposeAnnouncementDrawer)}
        >
          <CirclePlus className="mr-1.5 size-4" />
          New announcement
        </Button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-white py-14 text-sm text-grey2 dark:bg-card dark:text-gray-400">
          <Loader2 className="size-4 animate-spin" />
          Loading announcements…
        </div>
      )}

      {isError && !isLoading && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-white py-14 dark:bg-card">
          <AlertTriangle className="size-5 text-[#A8321E]" />
          <p className="text-sm text-grey2 dark:text-gray-400">
            Could not load the announcement history.
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      )}

      {!isLoading && !isError && rows.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-white py-14 text-center dark:bg-card">
          <Megaphone className="size-5 text-grey3 dark:text-gray-500" />
          <p className="text-sm font-medium text-grey-black dark:text-white">
            Nothing announced yet
          </p>
          <p className="max-w-[44ch] text-xs text-grey2 dark:text-gray-400">
            Downtime, policy changes, a holiday — the things worth telling
            everyone at once.
          </p>
        </div>
      )}

      {rows.length > 0 && (
        <div className="flex flex-col gap-3">
          {rows.map((row) => {
            const status = STATUS_STYLE[row.status] ?? STATUS_STYLE.sent;
            return (
              <div
                key={row._id}
                className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-4 dark:bg-card sm:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-col gap-1">
                    <span className="truncate text-sm font-semibold text-grey-black dark:text-white">
                      {row.subject}
                    </span>
                    <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-grey2 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Users className="size-3" />
                        {AUDIENCE_LABEL[row.audience]}
                      </span>
                      {row.send_email && (
                        <span className="flex items-center gap-1">
                          <Mail className="size-3" />
                          Email
                        </span>
                      )}
                      {row.scheduled_at && row.status === 'scheduled' && (
                        <span className="flex items-center gap-1">
                          <CalendarClock className="size-3" />
                          {fmtDate(row.scheduled_at)}
                        </span>
                      )}
                      {row.sent_at && <span>Sent {fmtDate(row.sent_at)}</span>}
                      {row.created_by_name && (
                        <span>by {row.created_by_name}</span>
                      )}
                    </span>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <span
                      className={`inline-flex h-[22px] items-center rounded-full px-2.5 text-[10px] font-semibold uppercase tracking-wide ${status.cls}`}
                    >
                      {status.label}
                    </span>
                    {row.status === 'scheduled' && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isCancelling}
                        onClick={() => handleCancel(row._id)}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>

                {/* Delivery counters. Only meaningful once a send has run, and
                    the reason the record exists at all. */}
                {(row.status === 'sent' || row.status === 'sending') && (
                  <div className="flex flex-wrap gap-x-6 gap-y-1 border-t border-border pt-3 text-[11px] text-grey2 dark:text-gray-400">
                    <span>
                      <strong className="text-grey-black dark:text-white">
                        {row.recipient_count}
                      </strong>{' '}
                      recipients
                    </span>
                    {row.send_email && (
                      <>
                        <span>
                          <strong className="text-grey-black dark:text-white">
                            {row.emails_sent}
                          </strong>{' '}
                          emails sent
                        </span>
                        {row.emails_failed > 0 && (
                          <span className="text-[#A8321E]">
                            <strong>{row.emails_failed}</strong> failed
                          </span>
                        )}
                      </>
                    )}
                    {row.status === 'sending' && (
                      <button
                        type="button"
                        onClick={() => refetch()}
                        className="ml-auto inline-flex items-center gap-1 font-medium text-primary"
                      >
                        {isFetching && (
                          <Loader2 className="size-3 animate-spin" />
                        )}
                        Refresh
                      </button>
                    )}
                  </div>
                )}

                {row.status === 'failed' && row.error && (
                  <p className="border-t border-border pt-3 text-[11px] text-[#A8321E]">
                    {row.error}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

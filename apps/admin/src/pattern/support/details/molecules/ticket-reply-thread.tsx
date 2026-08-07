'use client';

import type { TicketReply } from '@/redux/services/tickets/tickets.api-slice';
import { formatDateTime } from '../../lib/ticket-fields';

interface TicketReplyThreadProps {
  replies: TicketReply[];
  /** True when replies exist but arrived unpopulated (ids only). */
  unresolved?: boolean;
}

/**
 * The support conversation on a ticket.
 *
 * `sender` is a bare user id — the backend populates neither it nor a
 * `sender_type`, so replies are labelled generically rather than attributed to
 * a named person we'd have to invent.
 */
export const TicketReplyThread = ({
  replies,
  unresolved,
}: TicketReplyThreadProps) => {
  if (replies.length === 0) {
    return (
      <p className="text-sm text-grey3">
        {unresolved
          ? 'This ticket has replies, but they could not be loaded.'
          : 'No replies yet.'}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-[#3387CC]">
        {replies.length === 1 ? '1 Reply' : `${replies.length} Replies`}
      </p>

      <ul className="space-y-3">
        {replies.map((reply) => (
          <li
            key={reply._id}
            className="rounded-xl border border-border bg-[#F8F9FA] p-4"
          >
            <div className="mb-1 flex items-center justify-between gap-3">
              <span className="text-xs font-medium text-grey-black">
                {reply.sender_type
                  ? reply.sender_type.charAt(0).toUpperCase() +
                    reply.sender_type.slice(1)
                  : 'Support'}
              </span>
              <span className="shrink-0 text-xs text-grey3">
                {formatDateTime(reply.createdAt)}
              </span>
            </div>

            <p className="whitespace-pre-wrap text-sm leading-relaxed text-grey3">
              {reply.message}
            </p>

            {reply.attachments.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {reply.attachments.map((url) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-[#3387CC] underline"
                  >
                    Attachment
                  </a>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

// Display helpers for support tickets.
//
// These read the ticket shape returned by GET /admin/tickets, confirmed against
// the live backend. Earlier versions of this file guessed at a dozen possible
// key names (`reference`, `subject`, `user_name`, `customer.full_name`, …) —
// none of those fields exist, which is why several columns rendered "—".

import type { BadgeProps } from '@/components/ui/badge';
import type { Ticket } from '@/redux/services/tickets/tickets.api-slice';

export const EM_DASH = '—';

export type Row = Record<string, unknown>;

const str = (v: unknown): string | undefined =>
  typeof v === 'string' && v.trim() ? v.trim() : undefined;

/**
 * Display id for a ticket.
 *
 * Tickets have no human-readable reference — `_id` is the only identifier the
 * backend issues — so the last six characters stand in for one. They are the
 * high-entropy end of a Mongo ObjectId, so they stay distinct in practice; the
 * full id is still what gets copied and used in URLs.
 */
export const shortTicketId = (id?: string): string => {
  const value = str(id);
  return value ? `#${value.slice(-6).toUpperCase()}` : EM_DASH;
};

/**
 * Subject line for a ticket.
 *
 * There is no `subject` field, so the first line of the description stands in
 * for one — that is what a vendor actually types as their opening sentence.
 */
export const ticketSubject = (ticket?: Ticket): string => {
  const description = str(ticket?.description);
  if (!description) return EM_DASH;
  const [firstLine] = description.split('\n');
  return str(firstLine) ?? description;
};

/** Category column — the backend stores this free-form via CreateTicketDto. */
export const ticketCategory = (ticket?: Ticket): string =>
  str(ticket?.issue_type) ?? EM_DASH;

/**
 * Reads the assignee id. `assigned_to` is a bare support-team ObjectId (or
 * null); it is never populated, so a caller that wants a name must resolve it.
 */
export const assigneeId = (ticket?: Ticket): string | null =>
  str(ticket?.assigned_to) ?? null;

/** Generic first-non-blank-key reader, still used by the live-chat columns. */
export const readField = (row: Row, ...keys: string[]): string => {
  for (const key of keys) {
    const value = str(row[key]);
    if (value) return value;
  }
  return EM_DASH;
};

/** Format an ISO timestamp down to YYYY-MM-DD; pass through anything else. */
export const formatDate = (value: unknown): string => {
  const s = str(value);
  if (!s) return EM_DASH;
  return s.includes('T') ? s.slice(0, 10) : s;
};

/** Fuller timestamp for the reply thread, e.g. "7 Aug 2026, 03:59". */
export const formatDateTime = (value: unknown): string => {
  const s = str(value);
  if (!s) return EM_DASH;
  const date = new Date(s);
  if (Number.isNaN(date.getTime())) return s;
  return date.toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const statusVariant = (status?: string): BadgeProps['variant'] => {
  const s = (status ?? '').toLowerCase();
  if (['resolved', 'closed', 'completed'].includes(s)) return 'success';
  if (['open', 'rejected', 'failed'].includes(s)) return 'error';
  return 'warning';
};

export const statusLabel = (status?: string): string => {
  const s = str(status);
  if (!s) return 'Pending';
  return s.charAt(0).toUpperCase() + s.slice(1);
};

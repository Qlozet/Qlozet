import { describe, expect, it } from 'vitest';
import {
  assigneeId,
  formatDate,
  formatDateTime,
  readField,
  shortTicketId,
  statusLabel,
  statusVariant,
  ticketCategory,
  ticketSubject,
} from '../ticket-fields';
import { populatedReplies } from '@/redux/services/tickets/tickets.api-slice';

describe('shortTicketId', () => {
  it('renders the tail of the ObjectId as a display reference', () => {
    expect(shortTicketId('6a755761925ea84bde5f74db')).toBe('#5F74DB');
  });

  it('dashes when there is no id', () => {
    expect(shortTicketId(undefined)).toBe('—');
    expect(shortTicketId('   ')).toBe('—');
  });
});

describe('ticketSubject', () => {
  it('uses the first line of the description as the subject', () => {
    expect(
      ticketSubject({
        _id: 't1',
        description: 'Hello I have an issue with my order sheet.\nThanks',
      })
    ).toBe('Hello I have an issue with my order sheet.');
  });

  it('falls back to the whole description when it is single-line', () => {
    expect(ticketSubject({ _id: 't1', description: 'jksdcjociow' })).toBe(
      'jksdcjociow'
    );
  });

  it('dashes when there is no description', () => {
    expect(ticketSubject({ _id: 't1' })).toBe('—');
    expect(ticketSubject(undefined)).toBe('—');
  });
});

describe('ticketCategory', () => {
  it('reads issue_type', () => {
    expect(ticketCategory({ _id: 't1', issue_type: 'Order Issue' })).toBe(
      'Order Issue'
    );
    expect(ticketCategory({ _id: 't1' })).toBe('—');
  });
});

describe('assigneeId', () => {
  // null rather than '—' so the UI can flag the ticket as unassigned.
  it('returns null when unassigned', () => {
    expect(assigneeId({ _id: 't1', assigned_to: null })).toBeNull();
    expect(assigneeId({ _id: 't1' })).toBeNull();
    expect(assigneeId(undefined)).toBeNull();
  });

  it('returns the raw support-team id when assigned', () => {
    expect(assigneeId({ _id: 't1', assigned_to: 'team-1' })).toBe('team-1');
  });
});

describe('populatedReplies', () => {
  // The list endpoint populates replies; GET /tickets/{id} sends bare ids.
  it('keeps full reply objects', () => {
    const reply = {
      _id: 'r1',
      ticket_id: 't1',
      sender: 'u1',
      message: 'Okay we have started looking at it',
      attachments: [],
      createdAt: '2026-08-07T03:59:11.326Z',
      updatedAt: '2026-08-07T03:59:11.326Z',
    };
    expect(populatedReplies({ _id: 't1', replies: [reply] })).toEqual([reply]);
  });

  it('drops unpopulated id strings', () => {
    expect(populatedReplies({ _id: 't1', replies: ['r1', 'r2'] })).toEqual([]);
  });

  it('handles a ticket with no replies', () => {
    expect(populatedReplies({ _id: 't1' })).toEqual([]);
    expect(populatedReplies(undefined)).toEqual([]);
  });
});

describe('readField', () => {
  it('returns the first key that carries a non-blank string', () => {
    expect(readField({ a: '', b: '  ', c: 'value' }, 'a', 'b', 'c')).toBe(
      'value'
    );
  });

  it('dashes when no key matches', () => {
    expect(readField({}, 'a', 'b')).toBe('—');
    expect(readField({ a: 42 }, 'a')).toBe('—');
  });
});

describe('formatDate', () => {
  it('trims an ISO timestamp to the date part', () => {
    expect(formatDate('2026-03-09T10:00:00.000Z')).toBe('2026-03-09');
  });

  it('passes through a value that is already a plain date', () => {
    expect(formatDate('2026-03-09')).toBe('2026-03-09');
  });

  it('dashes anything missing or non-string', () => {
    expect(formatDate(undefined)).toBe('—');
    expect(formatDate('   ')).toBe('—');
    expect(formatDate(1234)).toBe('—');
  });
});

describe('formatDateTime', () => {
  it('renders a readable timestamp', () => {
    const out = formatDateTime('2026-08-07T03:59:11.326Z');
    expect(out).toContain('2026');
    expect(out).not.toBe('—');
  });

  it('passes an unparseable string through and dashes a missing one', () => {
    expect(formatDateTime('not-a-date')).toBe('not-a-date');
    expect(formatDateTime(undefined)).toBe('—');
  });
});

describe('status badge', () => {
  it('marks resolved-ish statuses as success', () => {
    for (const s of ['resolved', 'closed', 'completed', 'RESOLVED']) {
      expect(statusVariant(s)).toBe('success');
    }
  });

  it('marks open and failed statuses as error', () => {
    for (const s of ['open', 'rejected', 'failed']) {
      expect(statusVariant(s)).toBe('error');
    }
  });

  it('falls back to warning for anything else', () => {
    expect(statusVariant('in_progress')).toBe('warning');
    expect(statusVariant(undefined)).toBe('warning');
  });

  it('capitalises the label and defaults to Pending', () => {
    expect(statusLabel('resolved')).toBe('Resolved');
    expect(statusLabel('IN_PROGRESS')).toBe('IN_PROGRESS');
    expect(statusLabel(undefined)).toBe('Pending');
    expect(statusLabel('   ')).toBe('Pending');
  });
});

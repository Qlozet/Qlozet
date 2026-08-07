import { describe, expect, it } from 'vitest';
import {
  ISSUE_TYPES,
  formatDate,
  formatDateTime,
  issueTypeLabel,
  readAssigned,
  readField,
  readName,
  statusLabel,
  statusVariant,
} from '../ticket-fields';

describe('readName', () => {
  it('prefers the flat name columns, in order', () => {
    expect(readName({ user_name: 'Ada', vendor_name: 'Shop' })).toBe('Ada');
    expect(readName({ vendor_name: 'Shop' })).toBe('Shop');
    expect(readName({ customer_name: 'Bola' })).toBe('Bola');
  });

  it('falls back to a populated relation', () => {
    expect(readName({ user: { username: 'ada' } })).toBe('ada');
    expect(readName({ vendor: { business_name: 'Qlozet' } })).toBe('Qlozet');
    expect(readName({ customer: { email: 'a@b.co' } })).toBe('a@b.co');
  });

  it('never prints a raw relation id', () => {
    expect(readName({ user: 'user-1' })).toBe('—');
    expect(readName({})).toBe('—');
  });
});

describe('readAssigned', () => {
  it('reads the assignee across the API shapes', () => {
    expect(readAssigned({ assigned_to_name: 'Ada' })).toBe('Ada');
    expect(readAssigned({ assigned_to: { username: 'ada' } })).toBe('ada');
    expect(readAssigned({ assigned_to: 'agent-1' })).toBe('agent-1');
  });

  it('returns null when unassigned so the UI can flag it', () => {
    expect(readAssigned({})).toBeNull();
  });
});

describe('readField', () => {
  it('returns the first non-blank string key', () => {
    expect(readField({ a: '  ', b: 'value' }, 'a', 'b')).toBe('value');
    expect(readField({}, 'a')).toBe('—');
  });
});

describe('date formatters', () => {
  it('trims an ISO timestamp to the date part', () => {
    expect(formatDate('2023-05-25T12:25:00.000Z')).toBe('2023-05-25');
    expect(formatDate('2023-05-25')).toBe('2023-05-25');
    expect(formatDate(undefined)).toBe('—');
  });

  it('renders the list/detail timestamp', () => {
    // Built from local components so the assertion holds in any timezone.
    const iso = new Date(2023, 4, 25, 12, 25).toISOString();
    expect(formatDateTime(iso)).toBe('May 25, 2023 . 12:25pm');
  });

  it('echoes an unparseable value and dashes a missing one', () => {
    expect(formatDateTime('some day')).toBe('some day');
    expect(formatDateTime(undefined)).toBe('—');
    expect(formatDateTime(1234)).toBe('—');
  });
});

describe('issueTypeLabel', () => {
  it('maps every value the support form offers', () => {
    for (const type of ISSUE_TYPES) {
      expect(issueTypeLabel(type.value)).toBe(type.label);
    }
  });

  it('is case-insensitive', () => {
    expect(issueTypeLabel('BUGS')).toBe('Bugs and Issues');
  });

  // Tickets raised outside this form carry free text — pass it through rather
  // than forcing it into one of the five known buckets.
  it('passes an unknown value through untouched', () => {
    expect(issueTypeLabel('Delivery Delay')).toBe('Delivery Delay');
  });

  it('dashes a missing value', () => {
    expect(issueTypeLabel(undefined)).toBe('—');
    expect(issueTypeLabel('   ')).toBe('—');
  });
});

describe('status badge', () => {
  it('maps resolved-ish to success and open-ish to error', () => {
    expect(statusVariant('resolved')).toBe('success');
    expect(statusVariant('CLOSED')).toBe('success');
    expect(statusVariant('open')).toBe('error');
    expect(statusVariant('failed')).toBe('error');
  });

  it('falls back to warning', () => {
    expect(statusVariant('in_progress')).toBe('warning');
    expect(statusVariant(undefined)).toBe('warning');
  });

  it('capitalises the label and defaults to Pending', () => {
    expect(statusLabel('resolved')).toBe('Resolved');
    expect(statusLabel(undefined)).toBe('Pending');
  });
});

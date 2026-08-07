import { describe, expect, it } from 'vitest';
import {
  formatDate,
  readAgent,
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
    expect(readName({ customer: { full_name: 'Ada Obi' } })).toBe('Ada Obi');
    expect(readName({ vendor: { business_name: 'Qlozet' } })).toBe('Qlozet');
    expect(readName({ user: { email: 'a@b.co' } })).toBe('a@b.co');
  });

  it('ignores an unpopulated relation id', () => {
    expect(readName({ user: 'user-1' })).toBe('—');
  });

  it('dashes when there is nothing to show', () => {
    expect(readName({})).toBe('—');
    expect(readName({ user_name: '   ' })).toBe('—');
  });
});

describe('readAssigned', () => {
  it('reads the assignee across the shapes the API sends', () => {
    expect(readAssigned({ assigned_to_name: 'Ada' })).toBe('Ada');
    expect(readAssigned({ assigned_to: { username: 'ada' } })).toBe('ada');
    expect(readAssigned({ assigned_to: 'agent-1' })).toBe('agent-1');
  });

  // null rather than "—" so the UI can flag the ticket as unassigned.
  it('returns null when unassigned', () => {
    expect(readAssigned({})).toBeNull();
    expect(readAssigned({ assigned_to: '  ' })).toBeNull();
  });
});

describe('readAgent', () => {
  it('reads the agent or bot across the API spellings', () => {
    expect(readAgent({ chat_agent: 'Ada' })).toBe('Ada');
    expect(readAgent({ agent_name: 'Bola' })).toBe('Bola');
    expect(readAgent({ agent: { name: 'Chi' } })).toBe('Chi');
    expect(readAgent({ bot: 'Qbot' })).toBe('Qbot');
    expect(readAgent({})).toBe('—');
  });
});

describe('readField', () => {
  it('returns the first key that carries a non-blank string', () => {
    expect(readField({ a: '', b: '  ', c: 'value' }, 'a', 'b', 'c')).toBe('value');
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

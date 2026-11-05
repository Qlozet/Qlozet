import { describe, expect, it } from 'vitest';
import {
  inviteEmailSent,
  isValidInviteEmail,
  normalizeInviteEmail,
} from '../team-invite';

describe('normalizeInviteEmail', () => {
  it('trims and lowercases', () => {
    expect(normalizeInviteEmail('  Ada.Obi@Example.COM ')).toBe(
      'ada.obi@example.com'
    );
  });
});

describe('isValidInviteEmail', () => {
  it('accepts ordinary addresses, padding included', () => {
    expect(isValidInviteEmail('ada@example.com')).toBe(true);
    expect(isValidInviteEmail(' ada+shop@mail.example.ng ')).toBe(true);
  });

  it('rejects obvious slips', () => {
    expect(isValidInviteEmail('')).toBe(false);
    expect(isValidInviteEmail('ada')).toBe(false);
    expect(isValidInviteEmail('ada@example')).toBe(false);
    expect(isValidInviteEmail('ada @example.com')).toBe(false);
    expect(isValidInviteEmail('@example.com')).toBe(false);
  });
});

describe('inviteEmailSent', () => {
  it('reads the flag from data first, then the top level', () => {
    expect(inviteEmailSent({ data: { email_sent: false } })).toBe(false);
    expect(inviteEmailSent({ email_sent: false })).toBe(false);
    expect(inviteEmailSent({ data: { email_sent: true } })).toBe(true);
  });

  it('treats a missing flag as sent', () => {
    expect(inviteEmailSent({ data: { teamMember: {} } })).toBe(true);
    expect(inviteEmailSent(undefined)).toBe(true);
    expect(inviteEmailSent(null)).toBe(true);
  });
});

import { describe, expect, it } from 'vitest';
import type { CurrentUser } from '@/redux/services/users/users.api-slice';
import { initialsFrom, readUserAvatar, readUserName } from '../current-user';

const user = (patch: Record<string, unknown>) =>
  patch as unknown as CurrentUser;

describe('readUserName', () => {
  it('prefers full_name', () => {
    expect(
      readUserName(
        user({ full_name: 'Ada Obi', username: 'ada', email: 'a@b.co' })
      )
    ).toBe('Ada Obi');
  });

  it('composes first + last when full_name is absent', () => {
    expect(readUserName(user({ first_name: 'Ada', last_name: 'Obi' }))).toBe(
      'Ada Obi'
    );
  });

  it('uses a lone first or last name', () => {
    expect(readUserName(user({ first_name: 'Ada' }))).toBe('Ada');
    expect(readUserName(user({ last_name: 'Obi' }))).toBe('Obi');
  });

  it('falls back to username, then email', () => {
    expect(readUserName(user({ username: 'ada' }))).toBe('ada');
    expect(readUserName(user({ email: 'a@b.co' }))).toBe('a@b.co');
  });

  it('trims surrounding whitespace', () => {
    expect(readUserName(user({ full_name: '  Ada Obi  ' }))).toBe('Ada Obi');
  });

  // Returning null lets the caller show a skeleton instead of an empty name.
  it('returns null when there is nothing usable', () => {
    expect(readUserName(user({}))).toBeNull();
    expect(readUserName(user({ full_name: '   ', username: '' }))).toBeNull();
    expect(readUserName(undefined)).toBeNull();
  });
});

describe('readUserAvatar', () => {
  it('reads each of the key spellings the API uses', () => {
    expect(readUserAvatar(user({ profile_image: 'a.png' }))).toBe('a.png');
    expect(readUserAvatar(user({ profileImage: 'b.png' }))).toBe('b.png');
    expect(readUserAvatar(user({ avatar: 'c.png' }))).toBe('c.png');
    expect(readUserAvatar(user({ image: 'd.png' }))).toBe('d.png');
  });

  it('prefers profile_image when several are present', () => {
    expect(
      readUserAvatar(user({ profile_image: 'a.png', avatar: 'c.png' }))
    ).toBe('a.png');
  });

  it('returns null when the user has no avatar', () => {
    expect(readUserAvatar(user({}))).toBeNull();
    expect(readUserAvatar(user({ avatar: '  ' }))).toBeNull();
    expect(readUserAvatar(undefined)).toBeNull();
  });
});

describe('initialsFrom', () => {
  it('takes the first letter of the first two words, uppercased', () => {
    expect(initialsFrom('Ada Obi')).toBe('AO');
    expect(initialsFrom('ada obi nwosu')).toBe('AO');
  });

  it('handles a single word', () => {
    expect(initialsFrom('Ada')).toBe('A');
  });

  it('collapses extra whitespace', () => {
    expect(initialsFrom('  Ada   Obi ')).toBe('AO');
  });

  it('falls back to ? for an empty name', () => {
    expect(initialsFrom('')).toBe('?');
    expect(initialsFrom('   ')).toBe('?');
  });
});

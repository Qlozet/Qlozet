import { describe, expect, it } from 'vitest';
import type { Customer } from '@/redux/services/customers/customers.api-slice';
import {
  formatCount,
  formatDate,
  formatJoinedDate,
  formatLastLoggedIn,
  getCustomerAvatar,
  getCustomerEmail,
  getCustomerHandle,
  getCustomerInitial,
  getCustomerLastOrderDate,
  getCustomerName,
  getCustomerPhone,
  getCustomerStatus,
  getCustomerTotalOrders,
} from '../customers';

const customer = (patch: Record<string, unknown> = {}) =>
  patch as unknown as Customer;

describe('getCustomerStatus', () => {
  it('marks the blocked-ish statuses inactive', () => {
    for (const status of ['inactive', 'disabled', 'suspended', 'blocked', 'BLOCKED']) {
      expect(getCustomerStatus(customer({ status })).variant).toBe('inactive');
    }
  });

  // The table only has two states, so anything else reads as an ordinary
  // active customer rather than an unexplained blank.
  it('treats everything else as active', () => {
    for (const status of ['active', 'pending', 'whatever', '', undefined]) {
      expect(getCustomerStatus(customer({ status }))).toEqual({
        variant: 'active',
        label: 'Active',
      });
    }
  });
});

describe('customer identity', () => {
  it('reads the name, falling back to username then a placeholder', () => {
    expect(getCustomerName(customer({ name: 'Ada Obi', username: 'ada' }))).toBe(
      'Ada Obi'
    );
    expect(getCustomerName(customer({ username: 'ada' }))).toBe('ada');
    expect(getCustomerName(customer({}))).toBe('Unnamed customer');
  });

  it('prefixes the handle with @ exactly once', () => {
    expect(getCustomerHandle(customer({ username: 'ada' }))).toBe('@ada');
    expect(getCustomerHandle(customer({ username: '@ada' }))).toBe('@ada');
    expect(getCustomerHandle(customer({ username: '  ada  ' }))).toBe('@ada');
  });

  it('returns an empty handle rather than a lone @ when there is no username', () => {
    expect(getCustomerHandle(customer({}))).toBe('');
    expect(getCustomerHandle(customer({ username: '   ' }))).toBe('');
  });

  it('reads email and phone across the API spellings', () => {
    expect(getCustomerEmail(customer({ email: 'a@b.co' }))).toBe('a@b.co');
    expect(getCustomerEmail(customer({}))).toBe('—');
    expect(getCustomerPhone(customer({ phone: '0801' }))).toBe('0801');
    expect(getCustomerPhone(customer({ phone_number: '0802' }))).toBe('0802');
    expect(getCustomerPhone(customer({}))).toBe('—');
  });

  it('reads the avatar across the API spellings', () => {
    expect(getCustomerAvatar(customer({ avatar: 'a.png' }))).toBe('a.png');
    expect(getCustomerAvatar(customer({ image: 'b.png' }))).toBe('b.png');
    expect(getCustomerAvatar(customer({ profile_picture: 'c.png' }))).toBe('c.png');
    expect(getCustomerAvatar(customer({}))).toBeUndefined();
  });

  it('derives an initial, ignoring a leading @', () => {
    expect(getCustomerInitial(customer({ name: 'ada' }))).toBe('A');
    expect(getCustomerInitial(customer({ username: '@bola' }))).toBe('B');
  });

  it('reads order stats across the API spellings', () => {
    expect(getCustomerTotalOrders(customer({ totalOrders: 5 }))).toBe(5);
    expect(getCustomerTotalOrders(customer({ ordersCount: 3 }))).toBe(3);
    expect(getCustomerTotalOrders(customer({ totalOrders: 0 }))).toBe(0);
    expect(getCustomerTotalOrders(customer({}))).toBeUndefined();
    expect(getCustomerLastOrderDate(customer({ lastOrderDate: 'x' }))).toBe('x');
    expect(getCustomerLastOrderDate(customer({ lastOrderAt: 'y' }))).toBe('y');
  });
});

describe('customer formatters', () => {
  it('formats counts, dashing missing ones', () => {
    expect(formatCount(1200)).toBe('1,200');
    expect(formatCount(0)).toBe('0');
    expect(formatCount(undefined)).toBe('—');
    expect(formatCount(Number.NaN)).toBe('—');
  });

  it('formats a date as zero-padded DD/MM/YYYY', () => {
    expect(formatDate('2025-02-04T12:00:00.000Z')).toBe('04/02/2025');
    expect(formatDate(undefined)).toBe('—');
    expect(formatDate('nope')).toBe('—');
  });

  it('formats the joined date with an ordinal day', () => {
    expect(formatJoinedDate('2015-02-10T12:00:00.000Z')).toBe('10th Feb, 2015');
    expect(formatJoinedDate('2015-02-01T12:00:00.000Z')).toBe('1st Feb, 2015');
    expect(formatJoinedDate('2015-02-02T12:00:00.000Z')).toBe('2nd Feb, 2015');
    expect(formatJoinedDate('2015-02-03T12:00:00.000Z')).toBe('3rd Feb, 2015');
    expect(formatJoinedDate('2015-02-22T12:00:00.000Z')).toBe('22nd Feb, 2015');
  });

  // 11th/12th/13th are the classic ordinal trap.
  it('uses "th" for the teens', () => {
    expect(formatJoinedDate('2015-02-11T12:00:00.000Z')).toBe('11th Feb, 2015');
    expect(formatJoinedDate('2015-02-12T12:00:00.000Z')).toBe('12th Feb, 2015');
    expect(formatJoinedDate('2015-02-13T12:00:00.000Z')).toBe('13th Feb, 2015');
  });

  it('dashes a missing or unparseable joined date', () => {
    expect(formatJoinedDate(undefined)).toBe('—');
    expect(formatJoinedDate('nope')).toBe('—');
  });

  it('formats the last login as "10:45am - DD/MM/YYYY"', () => {
    // Built from local components so the assertion holds in any timezone.
    const lastLoggedIn = new Date(2025, 1, 24, 10, 45).toISOString();
    expect(formatLastLoggedIn(customer({ lastLoggedIn }))).toBe('10:45am - 24/02/2025');
  });

  it('reads the alternate lastLoginAt key', () => {
    const lastLoginAt = new Date(2025, 1, 24, 22, 5).toISOString();
    expect(formatLastLoggedIn(customer({ lastLoginAt }))).toBe('10:05pm - 24/02/2025');
  });

  it('passes through a preformatted string and dashes a missing one', () => {
    expect(formatLastLoggedIn(customer({ lastLoggedIn: 'Just now' }))).toBe('Just now');
    expect(formatLastLoggedIn(customer({}))).toBe('—');
  });
});

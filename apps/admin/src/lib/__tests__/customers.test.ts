import { describe, expect, it } from 'vitest';
import type { Customer } from '@/redux/services/customers/customers.api-slice';
import {
  formatCount,
  formatDate,
  formatJoinedDate,
  formatLastLoggedIn,
  formatNaira,
  getCustomerAvatar,
  getCustomerEmail,
  getCustomerFollowedVendors,
  getCustomerHandle,
  getCustomerInitial,
  getCustomerJoinedDate,
  getCustomerLastLoginAt,
  getCustomerLastOrderDate,
  getCustomerLifetimeSpending,
  getCustomerLocation,
  getCustomerName,
  getCustomerPendingBalance,
  getCustomerPhone,
  getCustomerReservedFabrics,
  getCustomerReviewsCount,
  getCustomerStatus,
  getCustomerTokenBalance,
  getCustomerTotalOrders,
  getCustomerTotalReturns,
  getCustomerWalletBalance,
} from '../customers';

const customer = (patch: Record<string, unknown> = {}) =>
  patch as unknown as Customer;

describe('getCustomerStatus', () => {
  it('marks the blocked-ish statuses inactive', () => {
    for (const status of [
      'inactive',
      'disabled',
      'suspended',
      'blocked',
      'BLOCKED',
    ]) {
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
    expect(
      getCustomerName(customer({ name: 'Ada Obi', username: 'ada' }))
    ).toBe('Ada Obi');
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
    expect(getCustomerAvatar(customer({ profile_picture: 'c.png' }))).toBe(
      'c.png'
    );
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
    expect(getCustomerLastOrderDate(customer({ lastOrderDate: 'x' }))).toBe(
      'x'
    );
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
    expect(formatLastLoggedIn(customer({ lastLoggedIn }))).toBe(
      '10:45am - 24/02/2025'
    );
  });

  it('reads the alternate lastLoginAt key', () => {
    const lastLoginAt = new Date(2025, 1, 24, 22, 5).toISOString();
    expect(formatLastLoggedIn(customer({ lastLoginAt }))).toBe(
      '10:05pm - 24/02/2025'
    );
  });

  it('passes through a preformatted string and dashes a missing one', () => {
    expect(formatLastLoggedIn(customer({ lastLoggedIn: 'Just now' }))).toBe(
      'Just now'
    );
    expect(formatLastLoggedIn(customer({}))).toBe('—');
  });
});

describe('customer field resolution', () => {
  it('reads the name field the endpoint actually sends', () => {
    // Every row rendered "Unnamed customer": this read `name` and `username`,
    // but the User schema defines `full_name`.
    expect(getCustomerName({ _id: 'c1', full_name: 'Kennedy Ekechukwu' })).toBe(
      'Kennedy Ekechukwu'
    );
  });

  it('still falls back through the older shapes', () => {
    expect(getCustomerName({ _id: 'c1', name: 'Legacy Name' })).toBe(
      'Legacy Name'
    );
    expect(
      getCustomerName({ _id: 'c1', first_name: 'Ada', last_name: 'Obi' })
    ).toBe('Ada Obi');
    expect(getCustomerName({ _id: 'c1', username: 'ada' })).toBe('ada');
    expect(getCustomerName({ _id: 'c1' })).toBe('Unnamed customer');
  });

  it('keeps a zero order count instead of dropping it', () => {
    // 0 is a fact — the customer has no orders. Rendering a dash instead would
    // say the figure is unknown.
    expect(getCustomerTotalOrders({ _id: 'c1', total_orders: 0 })).toBe(0);
    expect(getCustomerTotalOrders({ _id: 'c1', total_orders: 4 })).toBe(4);
    expect(getCustomerTotalOrders({ _id: 'c1' })).toBeUndefined();
  });

  it('reads the joined last-order date', () => {
    expect(
      getCustomerLastOrderDate({
        _id: 'c1',
        last_order_at: '2026-08-15T09:31:00.000Z',
      })
    ).toBe('2026-08-15T09:31:00.000Z');
    // null from the API (never ordered) is not a date.
    expect(
      getCustomerLastOrderDate({ _id: 'c1', last_order_at: null })
    ).toBeUndefined();
  });

  it('prefers phone_number, which is the schema field', () => {
    expect(
      getCustomerPhone({ _id: 'c1', phone_number: '+2348012347890' })
    ).toBe('+2348012347890');
  });
});

// GET /admin/customer/:id — snake_case throughout, and every count or money
// figure the data supports is a number, including 0.
describe('customer detail payload', () => {
  const detail = customer({
    location: 'Ikeja, Lagos',
    address: { state: 'Lagos', city: 'Ikeja' },
    created_at: '2026-07-05T00:00:00.000Z',
    last_login_at: '2026-08-26T09:12:00.000Z',
    reviews_count: 20,
    followed_vendors: 3,
    reserved_fabrics: 1,
    wallet_balance: 25000,
    pending_balance: 0,
    token_balance: 120,
    total_returns: 4500,
    lifetime_spending: 486000,
  });

  it('reads every field by its contract name', () => {
    expect(getCustomerLocation(detail)).toBe('Ikeja, Lagos');
    expect(getCustomerJoinedDate(detail)).toBe('2026-07-05T00:00:00.000Z');
    expect(getCustomerLastLoginAt(detail)).toBe('2026-08-26T09:12:00.000Z');
    expect(getCustomerReviewsCount(detail)).toBe(20);
    expect(getCustomerFollowedVendors(detail)).toBe(3);
    expect(getCustomerReservedFabrics(detail)).toBe(1);
    expect(getCustomerWalletBalance(detail)).toBe(25000);
    expect(getCustomerPendingBalance(detail)).toBe(0);
    expect(getCustomerTokenBalance(detail)).toBe(120);
    expect(getCustomerTotalReturns(detail)).toBe(4500);
    expect(getCustomerLifetimeSpending(detail)).toBe(486000);
  });

  it('keeps a zero rather than turning it into "unknown"', () => {
    for (const read of [
      getCustomerReviewsCount,
      getCustomerFollowedVendors,
      getCustomerReservedFabrics,
      getCustomerWalletBalance,
      getCustomerTokenBalance,
      getCustomerTotalReturns,
      getCustomerLifetimeSpending,
    ]) {
      expect(
        read(
          customer({
            reviews_count: 0,
            followed_vendors: 0,
            reserved_fabrics: 0,
            wallet_balance: 0,
            token_balance: 0,
            total_returns: 0,
            lifetime_spending: 0,
          })
        )
      ).toBe(0);
    }
  });

  it('treats null — the "no source at all" case — as absent', () => {
    const empty = customer({
      location: null,
      address: null,
      created_at: null,
      last_login_at: null,
      reviews_count: null,
      followed_vendors: null,
      reserved_fabrics: null,
      wallet_balance: null,
      token_balance: null,
      total_returns: null,
      lifetime_spending: null,
    });

    expect(getCustomerLocation(empty)).toBeUndefined();
    expect(getCustomerJoinedDate(empty)).toBeUndefined();
    expect(getCustomerLastLoginAt(empty)).toBeUndefined();
    expect(getCustomerReviewsCount(empty)).toBeUndefined();
    expect(getCustomerFollowedVendors(empty)).toBeUndefined();
    expect(getCustomerReservedFabrics(empty)).toBeUndefined();
    expect(getCustomerWalletBalance(empty)).toBeUndefined();
    expect(getCustomerTokenBalance(empty)).toBeUndefined();
    expect(getCustomerTotalReturns(empty)).toBeUndefined();
    expect(getCustomerLifetimeSpending(empty)).toBeUndefined();
  });

  it('builds a location from the address when the string is missing', () => {
    expect(
      getCustomerLocation(
        customer({ address: { state: 'Lagos', city: 'Ikeja' } })
      )
    ).toBe('Ikeja, Lagos');
    expect(getCustomerLocation(customer({ address: { state: 'Lagos' } }))).toBe(
      'Lagos'
    );
    expect(getCustomerLocation(customer({ address: { city: 'Ikeja' } }))).toBe(
      'Ikeja'
    );
    expect(getCustomerLocation(customer({ address: {} }))).toBeUndefined();
  });

  it('formats naira, keeping a zero balance as money', () => {
    expect(formatNaira(486000)).toBe('₦486,000');
    expect(formatNaira(0)).toBe('₦0');
    expect(formatNaira(null)).toBe('—');
    expect(formatNaira(undefined)).toBe('—');
  });

  it('formats the last login from last_login_at', () => {
    const last_login_at = new Date(2026, 7, 26, 9, 12).toISOString();
    expect(formatLastLoggedIn(customer({ last_login_at }))).toBe(
      '9:12am - 26/08/2026'
    );
  });
});

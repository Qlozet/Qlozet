import { afterEach, describe, expect, it } from 'vitest';
import {
  beginAccessLossHandling,
  classifyAccessLoss,
  resetAccessLossGuard,
} from '../access-loss';

describe('classifyAccessLoss', () => {
  it('spots the temporary-password block', () => {
    expect(
      classifyAccessLoss(403, 'Set your own password before using the store.')
    ).toBe('set-password');
  });

  it('spots access turned off and removal from the team', () => {
    expect(
      classifyAccessLoss(
        403,
        'The store owner has turned off your access to this store.'
      )
    ).toBe('revoked');
    expect(
      classifyAccessLoss(403, 'You are not a member of this business team')
    ).toBe('revoked');
  });

  it('ignores ordinary permission 403s', () => {
    expect(
      classifyAccessLoss(403, "Your role can't manage payouts.")
    ).toBeNull();
    expect(classifyAccessLoss(403, '')).toBeNull();
    expect(classifyAccessLoss(403, undefined)).toBeNull();
  });

  it('only reacts to 403', () => {
    expect(
      classifyAccessLoss(401, 'You are not a member of this business team')
    ).toBeNull();
    expect(
      classifyAccessLoss(400, 'Set your own password before using the store.')
    ).toBeNull();
  });
});

describe('access loss guard', () => {
  afterEach(() => resetAccessLossGuard());

  it('lets one handler through until reset', () => {
    expect(beginAccessLossHandling()).toBe(true);
    expect(beginAccessLossHandling()).toBe(false);
    resetAccessLossGuard();
    expect(beginAccessLossHandling()).toBe(true);
  });
});

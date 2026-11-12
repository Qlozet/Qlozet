import { describe, expect, it } from 'vitest';
import { confirmCountdown, formatTimeLeft } from '../confirm-countdown';

const HOUR = 3_600_000;
const now = Date.parse('2026-11-12T09:00:00Z'); // 10:00 in Lagos, a Thursday

describe('confirm countdown', () => {
  it('words the time left', () => {
    expect(formatTimeLeft(2 * 24 * HOUR + 3 * HOUR)).toBe('2d 3h');
    expect(formatTimeLeft(24 * HOUR)).toBe('1d');
    expect(formatTimeLeft(5 * HOUR + 20 * 60_000)).toBe('5h 20m');
    expect(formatTimeLeft(HOUR)).toBe('1h');
    expect(formatTimeLeft(12 * 60_000)).toBe('12m');
    expect(formatTimeLeft(20_000)).toBe('1m');
    expect(formatTimeLeft(-5)).toBe('now');
  });

  it('turns amber under 6 hours and red under 2', () => {
    expect(confirmCountdown(new Date(now + 30 * HOUR), now)?.tone).toBe('calm');
    expect(confirmCountdown(new Date(now + 5 * HOUR), now)?.tone).toBe('soon');
    expect(confirmCountdown(new Date(now + HOUR), now)?.tone).toBe('urgent');
    expect(confirmCountdown(new Date(now - 60_000), now)?.tone).toBe('overdue');
  });

  it('names the time in Lagos', () => {
    const c = confirmCountdown('2026-11-12T14:40:00Z', now);
    expect(c?.left).toBe('5h 40m');
    expect(c?.at).toMatch(/Thu/);
    expect(c?.at).toMatch(/3:40\s?pm/);
  });

  it('nothing to show without a deadline', () => {
    expect(confirmCountdown(undefined, now)).toBeNull();
    expect(confirmCountdown(null, now)).toBeNull();
    expect(confirmCountdown('not a date', now)).toBeNull();
  });
});

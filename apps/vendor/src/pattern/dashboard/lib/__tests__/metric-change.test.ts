import { describe, expect, it } from 'vitest';
import { formatMetricChange, readMetricChange } from '../metric-change';

describe('formatMetricChange', () => {
  it('keeps an already-formatted positive string', () => {
    expect(formatMetricChange('+24%')).toEqual({
      label: '+24%',
      value: 24,
      direction: 'up',
    });
  });

  it('keeps the sign on a negative string', () => {
    expect(formatMetricChange('-2.6%')).toEqual({
      label: '-2.6%',
      value: -2.6,
      direction: 'down',
    });
  });

  it('adds the missing + and % to a bare number', () => {
    expect(formatMetricChange(24)).toMatchObject({ label: '+24%', direction: 'up' });
    expect(formatMetricChange(-2.6)).toMatchObject({ label: '-2.6%', direction: 'down' });
    expect(formatMetricChange('2.5')).toMatchObject({ label: '+2.5%', direction: 'up' });
  });

  it('treats zero as flat, not as a negative', () => {
    expect(formatMetricChange(0)).toEqual({ label: '0%', value: 0, direction: 'flat' });
    expect(formatMetricChange('0%')).toMatchObject({ direction: 'flat' });
  });

  it('rounds to a single decimal place', () => {
    expect(formatMetricChange(2.55)?.label).toBe('+2.6%');
    expect(formatMetricChange(10.04)?.label).toBe('+10%');
  });

  it('tolerates stray whitespace and trailing copy', () => {
    expect(formatMetricChange(' + 24 % ')?.label).toBe('+24%');
    expect(formatMetricChange('2.5% vs last week')?.label).toBe('+2.5%');
  });

  it('unwraps a nested value object', () => {
    expect(formatMetricChange({ value: 12 })?.label).toBe('+12%');
    expect(formatMetricChange({ percentage: -3 })?.label).toBe('-3%');
  });

  // The bug this helper exists for: the card used to print these straight to
  // the screen, in red, as if they were a real negative delta.
  it('returns undefined for placeholders rather than a bogus indicator', () => {
    for (const raw of ['—', '-', 'N/A', 'n/a', 'null', '', '   ', undefined, null]) {
      expect(formatMetricChange(raw)).toBeUndefined();
    }
  });

  it('returns undefined for unparseable input', () => {
    expect(formatMetricChange('up a bit')).toBeUndefined();
    expect(formatMetricChange(Number.NaN)).toBeUndefined();
    expect(formatMetricChange(Number.POSITIVE_INFINITY)).toBeUndefined();
    expect(formatMetricChange(true)).toBeUndefined();
  });
});

describe('readMetricChange', () => {
  it('reads the documented camelCase key', () => {
    const summary = { totalOrders: 1000, totalOrdersChange: '+24%' };
    expect(readMetricChange(summary, 'totalOrders')?.label).toBe('+24%');
  });

  it('reads the snake_case spelling', () => {
    expect(
      readMetricChange({ total_orders_change: -5 }, 'totalOrders')?.label
    ).toBe('-5%');
  });

  it('reads the percent-infix spellings', () => {
    expect(
      readMetricChange({ totalEarningsPercentChange: 3 }, 'totalEarnings')?.label
    ).toBe('+3%');
    expect(
      readMetricChange({ total_returns_percentage_change: 1.5 }, 'totalReturns')
        ?.label
    ).toBe('+1.5%');
  });

  it('skips a placeholder key and keeps looking', () => {
    const summary = { totalOrdersChange: '—', total_orders_change: 7 };
    expect(readMetricChange(summary, 'totalOrders')?.label).toBe('+7%');
  });

  it('returns undefined when the summary has no change for the metric', () => {
    expect(readMetricChange({ totalOrders: 10 }, 'totalOrders')).toBeUndefined();
  });

  it('returns undefined for a missing or non-object summary', () => {
    expect(readMetricChange(undefined, 'totalOrders')).toBeUndefined();
    expect(readMetricChange(null, 'totalOrders')).toBeUndefined();
    expect(readMetricChange('nope', 'totalOrders')).toBeUndefined();
  });
});

import { describe, expect, it } from 'vitest';
import {
  latePreviewLines,
  shipByBadge,
  type LatePreview,
} from '../late-preview';

const DAY = 86_400_000;
const shipBy = '2026-11-18T12:00:00Z'; // a Wednesday
const preview = (o: Partial<LatePreview> = {}): LatePreview => ({
  ship_by: shipBy,
  per_day: 1_250,
  cap: 6_250,
  days_late: 0,
  charged: 0,
  cancel_on: '2026-11-25T12:00:00Z',
  paused: false,
  ...o,
});
const at = Date.parse(shipBy);

describe('ship-by badge', () => {
  it('names the day, amber within 2 days', () => {
    expect(shipByBadge(preview(), at - 5 * DAY)).toEqual({
      label: 'Ship by Wed 18 Nov',
      tone: 'calm',
    });
    expect(shipByBadge(preview(), at - DAY)?.tone).toBe('soon');
  });

  it('says how late once it is late', () => {
    expect(shipByBadge(preview({ days_late: 1 }), at + 1)).toEqual({
      label: '1 day late',
      tone: 'late',
    });
    expect(shipByBadge(preview({ days_late: 3 }), at + 3 * DAY)?.label).toBe(
      '3 days late'
    );
  });

  it('paused while waiting on a bespoke balance; nothing without a preview', () => {
    expect(shipByBadge(preview({ paused: true }))?.label).toBe(
      'Awaiting balance'
    );
    expect(shipByBadge(null)).toBeNull();
  });
});

describe('drawer wording', () => {
  it('before the date: the cost per day, the cap, and the cancel date', () => {
    expect(latePreviewLines(preview())).toEqual([
      'Shipping after Wed 18 Nov costs ₦1,250 a day from your earnings, up to ₦6,250, paid to the customer.',
      'If it still has not shipped by Wed 25 Nov, the order is cancelled and the customer refunded.',
    ]);
  });

  it('after it: what has been taken so far', () => {
    const [first] = latePreviewLines(preview({ days_late: 2, charged: 2_500 }));
    expect(first).toBe(
      '2 days late. ₦2,500 has been taken from your earnings so far and paid to the customer; it can reach ₦6,250.'
    );
  });

  it('no cancel line when the cancellation is switched off', () => {
    expect(latePreviewLines(preview({ cancel_on: null }))).toHaveLength(1);
  });

  it('paused: one line, no amounts', () => {
    const lines = latePreviewLines(preview({ paused: true }));
    expect(lines).toHaveLength(1);
    expect(lines[0]).toMatch(/balance/);
  });
});

describe('why the clock is paused', () => {
  it('names the wait in the badge and the drawer', () => {
    expect(
      shipByBadge(preview({ paused: true, paused_reason: 'fabric' }))?.label
    ).toBe('Waiting for fabric');
    expect(
      shipByBadge(preview({ paused: true, paused_reason: 'measurements' }))
        ?.label
    ).toBe('Waiting on customer');
    expect(
      latePreviewLines(preview({ paused: true, paused_reason: 'fabric' }))[0]
    ).toMatch(/starts when it arrives/);
  });

  it('an older backend without a reason means the balance', () => {
    expect(shipByBadge(preview({ paused: true }))?.label).toBe(
      'Awaiting balance'
    );
  });
});

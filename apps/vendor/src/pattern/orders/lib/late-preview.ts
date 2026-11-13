/**
 * Ship-by date and what lateness would cost, in words.
 *
 * The backend sends `late_preview` on an order this store has confirmed but
 * not shipped: the ship-by date, what each late day costs, the most it can
 * cost, what has been charged and when the order is cancelled. The amounts
 * come from the same rules the penalty job uses (backend
 * orders/late-penalty.ts); this file only puts them into words.
 */

export interface LatePreview {
  ship_by: string;
  per_day: number;
  cap: number;
  days_late: number;
  charged: number;
  cancel_on: string | null;
  paused: boolean;
  /** Why the clock is not running. Missing on an older backend: the balance. */
  paused_reason?: 'balance' | 'fabric' | 'measurements' | null;
}

const PAUSED_LABEL = {
  balance: 'Awaiting balance',
  fabric: 'Waiting for fabric',
  measurements: 'Waiting on customer',
} as const;

const PAUSED_LINE = {
  balance:
    "Waiting for the customer's balance. Lateness is not counted until they pay.",
  fabric:
    'Waiting for the fabric from the other shop. Your making time starts when it arrives, and lateness is not counted until then.',
  measurements:
    "Waiting for the customer's answer about measurements. Up to 3 days of waiting is added to your ship-by date.",
} as const;

const reasonOf = (p: LatePreview) => p.paused_reason ?? 'balance';

export type ShipByTone = 'calm' | 'soon' | 'late' | 'paused';

const DAY = 86_400_000;

const naira = (n: number) => `₦${Math.round(n).toLocaleString('en-NG')}`;

/** "Tue 18 Nov" in Lagos time. */
export function formatShipDay(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleDateString('en-GB', {
    timeZone: 'Africa/Lagos',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

/** The short label for the orders list, with its colour. */
export function shipByBadge(
  preview: LatePreview | null | undefined,
  now: number = Date.now()
): { label: string; tone: ShipByTone } | null {
  if (!preview) return null;
  if (preview.paused)
    return { label: PAUSED_LABEL[reasonOf(preview)], tone: 'paused' };
  if (preview.days_late > 0) {
    return {
      label: `${preview.days_late} day${preview.days_late === 1 ? '' : 's'} late`,
      tone: 'late',
    };
  }
  const msLeft = new Date(preview.ship_by).getTime() - now;
  if (msLeft <= 0) return { label: 'Ship today', tone: 'late' };
  return {
    label: `Ship by ${formatShipDay(preview.ship_by)}`,
    tone: msLeft <= 2 * DAY ? 'soon' : 'calm',
  };
}

/** The sentences under "Fulfill by" in the order drawer. */
export function latePreviewLines(
  preview: LatePreview | null | undefined
): string[] {
  if (!preview) return [];
  if (preview.paused) return [PAUSED_LINE[reasonOf(preview)]];
  const lines: string[] = [];
  const day = formatShipDay(preview.ship_by);
  if (preview.days_late > 0) {
    lines.push(
      `${preview.days_late} day${preview.days_late === 1 ? '' : 's'} late. ${naira(preview.charged)} has been taken from your earnings so far and paid to the customer; it can reach ${naira(preview.cap)}.`
    );
  } else if (preview.per_day > 0) {
    lines.push(
      `Shipping after ${day} costs ${naira(preview.per_day)} a day from your earnings, up to ${naira(preview.cap)}, paid to the customer.`
    );
  }
  if (preview.cancel_on) {
    lines.push(
      `If it still has not shipped by ${formatShipDay(preview.cancel_on)}, the order is cancelled and the customer refunded.`
    );
  }
  return lines;
}

/** Pill colours, matching the order status pills. */
export const SHIP_BY_TONE_CLASS: Record<ShipByTone, string> = {
  calm: 'bg-[#EAECF0] text-[#475467]',
  soon: 'bg-[#FEF6E7] text-[#DD900D]',
  late: 'bg-[#FBEAE9] text-[#D42620]',
  paused: 'bg-[#F4EBFF] text-[#7E22CE]',
};

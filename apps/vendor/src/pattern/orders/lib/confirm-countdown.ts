/**
 * The countdown to an order's confirm-by time.
 *
 * The backend sends `confirm_by` on an order still waiting for this store to
 * confirm: the moment it is cancelled and the customer refunded if nobody
 * confirms or declines it. It is worked out there from the admin setting, so
 * the app never repeats the rule; this only turns it into words and a colour.
 */

export type ConfirmTone = 'calm' | 'soon' | 'urgent' | 'overdue';

export interface ConfirmCountdown {
  /** "5h 20m", "2d 3h", "12m"; "now" once it has passed. */
  left: string;
  tone: ConfirmTone;
  /** When it cancels, in the store's local time: "Thu 3:40 pm". */
  at: string;
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** Under 6 hours turns amber, under 2 hours red. */
export const SOON_MS = 6 * HOUR;
export const URGENT_MS = 2 * HOUR;

export function formatTimeLeft(ms: number): string {
  if (ms <= 0) return 'now';
  if (ms >= DAY) {
    const days = Math.floor(ms / DAY);
    const hours = Math.floor((ms % DAY) / HOUR);
    return hours ? `${days}d ${hours}h` : `${days}d`;
  }
  if (ms >= HOUR) {
    const hours = Math.floor(ms / HOUR);
    const minutes = Math.floor((ms % HOUR) / MINUTE);
    return minutes ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  return `${Math.max(1, Math.floor(ms / MINUTE))}m`;
}

export function formatConfirmAt(date: Date): string {
  return date
    .toLocaleString('en-NG', {
      timeZone: 'Africa/Lagos',
      weekday: 'short',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
    .replace(/\s?(AM|PM)$/i, (m) => m.toLowerCase());
}

export function confirmCountdown(
  confirmBy: string | Date | null | undefined,
  now: number = Date.now()
): ConfirmCountdown | null {
  if (!confirmBy) return null;
  const by = confirmBy instanceof Date ? confirmBy : new Date(confirmBy);
  if (Number.isNaN(by.getTime())) return null;
  const ms = by.getTime() - now;
  const tone: ConfirmTone =
    ms <= 0
      ? 'overdue'
      : ms < URGENT_MS
        ? 'urgent'
        : ms < SOON_MS
          ? 'soon'
          : 'calm';
  return { left: formatTimeLeft(ms), tone, at: formatConfirmAt(by) };
}

/** Pill colours per tone, matching the order status pills. */
export const CONFIRM_TONE_CLASS: Record<ConfirmTone, string> = {
  calm: 'bg-[#E7F0FA] text-[#3387CC]',
  soon: 'bg-[#FEF6E7] text-[#DD900D]',
  urgent: 'bg-[#FBEAE9] text-[#D42620]',
  overdue: 'bg-[#FBEAE9] text-[#D42620]',
};

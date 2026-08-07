// Period-over-period deltas for the dashboard's top metric cards.
//
// The `/orders/chart` summary carries a change figure alongside each headline
// number, but the exact key has drifted between backend revisions (camelCase vs
// snake_case, with and without a "percent"/"percentage" infix) and the value
// arrives either pre-formatted ("+24%") or as a raw number (24, -2.6, "2.5").
//
// `readMetricChange` accepts all of those and returns one canonical label, or
// `undefined` when the backend genuinely sent nothing — so a card can hide the
// indicator instead of rendering a red em-dash, which is what it did while the
// key it was reading no longer existed.

export type ChangeDirection = 'up' | 'down' | 'flat';

export interface MetricChange {
  /** Signed, percent-suffixed label, e.g. "+24%", "-2.6%", "0%". */
  label: string;
  /** The parsed numeric percentage. */
  value: number;
  direction: ChangeDirection;
}

const directionOf = (value: number): ChangeDirection =>
  value > 0 ? 'up' : value < 0 ? 'down' : 'flat';

// At most one decimal place, and never a trailing ".0".
const trim = (value: number): string =>
  String(Math.round(value * 10) / 10);

/** Turn a raw change value into a canonical label, or undefined if unusable. */
export const formatMetricChange = (raw: unknown): MetricChange | undefined => {
  let value: number | undefined;

  if (typeof raw === 'number') {
    value = raw;
  } else if (typeof raw === 'string') {
    const text = raw.trim();
    // Placeholders the backend (or an older frontend default) may send.
    if (!text || /^(—|-|n\/?a|null|undefined)$/i.test(text)) return undefined;
    // Tolerates "+24%", "24 %", "-2.6", "2.5% vs last week".
    const match = text.match(/^([+-]?\s*\d+(?:\.\d+)?)\s*%?/);
    if (!match) return undefined;
    value = Number(match[1].replace(/\s+/g, ''));
  } else if (raw && typeof raw === 'object') {
    // Some revisions nest it, e.g. { value: 24 } or { percentage: -2.6 }.
    const nested = raw as Record<string, unknown>;
    return formatMetricChange(
      nested.value ?? nested.percentage ?? nested.percent ?? nested.change
    );
  }

  if (value === undefined || !Number.isFinite(value)) return undefined;

  const sign = value > 0 ? '+' : '';
  return {
    label: `${sign}${trim(value)}%`,
    value,
    direction: directionOf(value),
  };
};

/**
 * Read the change for `metric` (e.g. "totalOrders") off a summary object,
 * trying every key spelling the backend has used.
 */
export const readMetricChange = (
  summary: unknown,
  metric: string
): MetricChange | undefined => {
  if (!summary || typeof summary !== 'object') return undefined;
  const record = summary as Record<string, unknown>;

  // "totalOrders" -> "total_orders"
  const snake = metric.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();

  const candidates = [
    `${metric}Change`,
    `${metric}PercentChange`,
    `${metric}PercentageChange`,
    `${metric}ChangePercent`,
    `${metric}ChangePercentage`,
    `${snake}_change`,
    `${snake}_percent_change`,
    `${snake}_percentage_change`,
    `${snake}_change_percent`,
  ];

  for (const key of candidates) {
    if (record[key] === undefined || record[key] === null) continue;
    const change = formatMetricChange(record[key]);
    if (change) return change;
  }
  return undefined;
};

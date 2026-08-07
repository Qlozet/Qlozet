// Derives dashboard chart series from real marketplace orders.
//
// There is no admin analytics endpoint — `/orders/chart` is the vendor app's
// and is scoped to the caller's own business. What the admin console does have
// is `/admin/vendor/orders`, which returns every order on the platform, so the
// series below are aggregated from that client-side.
//
// Nothing here invents numbers: a month with no orders is 0, and callers use
// `hasAnyValue` to decide whether to render a chart or the empty template.

import type { AdminOrder } from '@/redux/services/orders/orders.api-slice';
import { readAmountPaid, readRefundStatus, readStatus } from '@/lib/orders';

export interface SeriesPoint {
  name: string;
  value: number;
}

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const orderDate = (order: AdminOrder): Date | null => {
  const raw = order.createdAt;
  if (typeof raw !== 'string') return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
};

/** True when at least one point carries a non-zero value. */
export const hasAnyValue = (series: SeriesPoint[]): boolean =>
  series.some((point) => point.value > 0);

/**
 * Twelve calendar months of the most recent year present in the data, so the
 * axis always reads Jan…Dec rather than a ragged range.
 */
const byMonth = (
  orders: AdminOrder[],
  reduce: (order: AdminOrder) => number
): SeriesPoint[] => {
  const totals = new Array(12).fill(0) as number[];

  // Anchor on the latest order's year; without orders the series is all zeroes
  // and the caller shows the empty state anyway.
  const years = orders
    .map(orderDate)
    .filter((date): date is Date => date !== null)
    .map((date) => date.getFullYear());
  const targetYear = years.length ? Math.max(...years) : null;

  for (const order of orders) {
    const date = orderDate(order);
    if (!date || date.getFullYear() !== targetYear) continue;
    totals[date.getMonth()] += reduce(order);
  }

  return MONTHS.map((name, index) => ({
    name,
    value: Math.round(totals[index] * 100) / 100,
  }));
};

/** Revenue per month, from amount actually paid. */
export const monthlyRevenueSeries = (orders: AdminOrder[]): SeriesPoint[] =>
  byMonth(orders, (order) => readAmountPaid(order) ?? 0);

/** Order volume per month. */
export const monthlyOrderCountSeries = (orders: AdminOrder[]): SeriesPoint[] =>
  byMonth(orders, () => 1);

/** Order counts grouped by delivery status. */
export const statusBreakdown = (orders: AdminOrder[]): SeriesPoint[] => {
  const counts = new Map<string, number>();
  for (const order of orders) {
    const status = readStatus(order);
    if (!status || status === '—') continue;
    counts.set(status, (counts.get(status) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([name, value]) => ({
      name: name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      value,
    }))
    .sort((a, b) => b.value - a.value);
};

/**
 * Refunded vs not, derived from the (undocumented) refund fields. Returns an
 * empty array when no order carries refund information, so the card shows the
 * empty template rather than claiming a 0% return rate it can't substantiate.
 */
export const returnsBreakdown = (orders: AdminOrder[]): SeriesPoint[] => {
  const known = orders.filter((order) => readRefundStatus(order) !== undefined);
  if (known.length === 0) return [];

  let refunded = 0;
  for (const order of known) {
    const status = (readRefundStatus(order) ?? '').toLowerCase();
    if (status && status !== 'none' && status !== 'not refunded') refunded += 1;
  }

  return [
    { name: 'Returned', value: refunded },
    { name: 'Kept', value: known.length - refunded },
  ];
};

/** Running revenue total across the months of the latest year. */
export const cumulativeRevenueSeries = (
  orders: AdminOrder[]
): SeriesPoint[] => {
  let running = 0;
  return monthlyRevenueSeries(orders).map((point) => {
    running += point.value;
    return { name: point.name, value: Math.round(running * 100) / 100 };
  });
};

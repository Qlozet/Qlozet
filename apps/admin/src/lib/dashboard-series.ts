// Readers for the dashboard chart payload.
//
// These series used to be aggregated in the browser from `/admin/vendor/orders`
// because no admin analytics endpoint existed. It does now —
// `GET /admin/dashboard/charts` — and the client-side aggregation was not just
// redundant but wrong: that endpoint paginates at 10 rows by default, so every
// chart was summing the ten most recent orders and presenting the result as a
// year.
//
// What is left here is shape-mapping only. The API speaks `{ label, value }`
// (the same envelope the vendor dashboard consumes); recharts and `DonutChart`
// want `{ name, value }`.

import type {
  Chart,
  ChartPoint,
} from '@/redux/services/dashboard/dashboard.api-slice';
import type { AdminOrder } from '@/redux/services/orders/orders.api-slice';
import { readRefundStatus } from '@/lib/orders';

export interface SeriesPoint {
  name: string;
  value: number;
  /** Carried through from the API for the categorical charts. */
  color?: string;
}

/** The first series of a chart, as recharts-shaped points. Empty when absent. */
export const readSeries = (chart?: Chart): SeriesPoint[] =>
  (chart?.series?.[0]?.data ?? []).map((point: ChartPoint) => ({
    // An unlabelled point still plots a bar, so a blank label reads as a bar
    // with no axis tick under it — which is how orders shipped to an address
    // with no state showed up. Name them rather than leaving a silent gap.
    name:
      typeof point.label === 'string' && point.label.trim()
        ? point.label
        : 'Unknown',
    value: point.value,
    ...(point.color ? { color: point.color } : {}),
  }));

/** True when at least one point carries a non-zero value. */
export const hasAnyValue = (series: SeriesPoint[]): boolean =>
  series.some((point) => point.value > 0);

/** Sum of a series — for a chart whose headline the API doesn't already carry. */
export const sumSeries = (series: SeriesPoint[]): number =>
  Math.round(series.reduce((total, point) => total + point.value, 0) * 100) /
  100;

/** Largest value in a series, or 0 when it is empty. */
export const maxOf = (series: SeriesPoint[]): number =>
  series.reduce((max, point) => Math.max(max, point.value), 0);

/**
 * Drop the zero points from a categorical chart. The status chart deliberately
 * ships every status — including the ones at zero — so its legend is stable;
 * a donut, though, should not draw invisible slices with visible legend rows.
 */
export const withoutZeroes = (series: SeriesPoint[]): SeriesPoint[] =>
  series.filter((point) => point.value > 0);

/**
 * Refunded vs not, derived from the (undocumented) refund fields on an order.
 * Still client-side: there is no returns chart on `/admin/dashboard/charts`,
 * and this one is fed a caller-supplied order list rather than the dashboard's.
 *
 * Returns an empty array when no order carries refund information, so the card
 * shows the empty template rather than claiming a 0% return rate it can't
 * substantiate.
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

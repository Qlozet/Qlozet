/**
 * The dashboard's time window: one setting for every chart and stat card on
 * the page, so they all describe the same period. Mirrors the backend presets
 * in orders/dashboard-range.ts - the server buckets the series to match.
 */
export const DASHBOARD_RANGE_KEYS = ['7d', '30d', '12w', '12m'] as const;
export type DashboardRangeKey = (typeof DASHBOARD_RANGE_KEYS)[number];

export interface DashboardRangeOption {
  key: DashboardRangeKey;
  label: string;
  /** How the series is bucketed - shown as the hint beside the label. */
  hint: string;
}

export const DASHBOARD_RANGE_OPTIONS: DashboardRangeOption[] = [
  { key: '7d', label: 'Last 7 days', hint: 'by day' },
  { key: '30d', label: 'Last 30 days', hint: 'by day' },
  { key: '12w', label: 'Last 12 weeks', hint: 'by week' },
  { key: '12m', label: 'Last 12 months', hint: 'by month' },
];

export const DEFAULT_DASHBOARD_RANGE: DashboardRangeKey = '7d';
export const DASHBOARD_RANGE_STORAGE_KEY = 'qlozet.vendor.dashboard-range';

export function isDashboardRangeKey(
  value: unknown
): value is DashboardRangeKey {
  return (
    typeof value === 'string' &&
    (DASHBOARD_RANGE_KEYS as readonly string[]).includes(value)
  );
}

export function dashboardRangeOption(
  key: DashboardRangeKey
): DashboardRangeOption {
  return (
    DASHBOARD_RANGE_OPTIONS.find((o) => o.key === key) ??
    DASHBOARD_RANGE_OPTIONS[0]
  );
}

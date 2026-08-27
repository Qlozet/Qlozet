'use client';

import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { hasAnyValue, type SeriesPoint } from '@/lib/dashboard-series';
import { CustomXAxisTick } from '@/pattern/dashboard/molecules/custom-x-axis-tick';
import { CustomYAxisTick } from '@/pattern/dashboard/molecules/custom-y-axis-tick';
import { ChartSkeleton } from '@/pattern/dashboard/molecules/chart-skeleton';
import { useGetVendorChartQuery } from '@/redux/services/vendor-details/vendor-details.api-slice';
import { ChartEmptyState } from '@/pattern/dashboard/molecules/chart-empty-state';
import type { VendorDashboardMetrics } from '@/redux/services/dashboard/dashboard.api-slice';
import { formatNaira } from '@/lib/vendors';

interface VendorAnalyticsSectionProps {
  metrics?: VendorDashboardMetrics;
  /** The vendor whose charts to load. */
  businessId?: string;
}

const num = (value: unknown): number | undefined =>
  typeof value === 'number' && Number.isFinite(value) ? value : undefined;

const Stat = ({ label, value }: { label: string; value: string }) => (
  <Card className="rounded-[12px] custom-card-shadow">
    <CardContent className="p-5">
      <p className="text-xs text-[hsla(210,9%,31%,1)]">{label}</p>
      <p className="mt-2 text-2xl font-bold text-[hsla(210,9%,31%,1)]">
        {value}
      </p>
    </CardContent>
  </Card>
);

/**
 * Vendor analytics.
 *
 * The four figures come from `/admin/vendor/dashboard?businessId=`. They used
 * to be read as `grossSales` / `totalOrders` / `totalProducts` /
 * `totalCustomers` — camelCase keys that endpoint has never sent — so all four
 * rendered a dash regardless of the data. It sends snake_case, and gross sales,
 * products and customers were not in the payload at all until they were added
 * for this section.
 *
 * The charts come from `/admin/businesses/:id/chart`, which serves the same
 * bundle the vendor app reads at `/orders/chart` but scoped to the business in
 * the path. This section previously composed the marketplace dashboard's chart
 * organisms, which read `/admin/vendor/orders` — every order on the platform,
 * with no vendor filter — so one vendor's page showed whole-marketplace
 * earnings as though they were theirs.
 */
export const VendorAnalyticsSection = ({
  metrics,
  businessId,
}: VendorAnalyticsSectionProps) => {
  // snake_case: that is what the endpoint sends. The camelCase reads this
  // replaced silently produced undefined for every card.
  const grossSales = num(metrics?.gross_sales);
  const totalOrders = num(metrics?.total_orders);
  const totalProducts = num(metrics?.total_products);
  const totalCustomers = num(metrics?.total_customers);

  const { data: chartRes, isLoading: isChartLoading } = useGetVendorChartQuery(
    businessId ?? '',
    { skip: !businessId }
  );
  const charts = chartRes?.data?.charts;

  // The weekday order-count series is the one cut that is meaningful for a
  // single vendor without a date range; the rest of the bundle's charts are
  // distributions rendered elsewhere on this page.
  const orderCounts = useMemo<SeriesPoint[]>(
    () =>
      (charts?.orderCountByDay?.series?.[0]?.data ?? []).map((point) => ({
        name: point.label,
        value: point.value,
      })),
    [charts]
  );
  const hasOrderCounts = hasAnyValue(orderCounts);

  return (
    <section className="space-y-6">
      <h2 className="text-lg font-bold text-[hsla(210,9%,31%,1)]">Analytics</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Gross sales"
          value={grossSales === undefined ? '—' : formatNaira(grossSales)}
        />
        <Stat
          label="Total orders"
          value={totalOrders?.toLocaleString() ?? '—'}
        />
        <Stat
          label="Total products"
          value={totalProducts?.toLocaleString() ?? '—'}
        />
        <Stat
          label="Total customers"
          value={totalCustomers?.toLocaleString() ?? '—'}
        />
      </div>

      <Card className="rounded-[12px] custom-card-shadow">
        <CardHeader className="px-6 pb-4">
          <CardTitle className="text-sm font-medium text-[hsla(210,9%,31%,1)]">
            Order volume by day of week
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-0">
          {isChartLoading ? (
            <ChartSkeleton />
          ) : (
            <ChartEmptyState
              isEmpty={!hasOrderCounts}
              height={220}
              description="This vendor's order volume will chart here once they take orders."
            >
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={orderCounts}
                  margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="0"
                    vertical={false}
                    stroke="#e5e7eb"
                  />
                  <XAxis
                    dataKey="name"
                    tick={<CustomXAxisTick />}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={<CustomYAxisTick />}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Bar
                    dataKey="value"
                    fill="#c4b5a0"
                    maxBarSize={24}
                    radius={[2.26, 2.26, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartEmptyState>
          )}
        </CardContent>
      </Card>
    </section>
  );
};

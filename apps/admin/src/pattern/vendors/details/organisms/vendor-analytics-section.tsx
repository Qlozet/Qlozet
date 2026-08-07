'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartEmptyState } from '@/pattern/dashboard/molecules/chart-empty-state';
import type { VendorDashboardMetrics } from '@/redux/services/dashboard/dashboard.api-slice';
import { formatNaira } from '@/lib/vendors';

interface VendorAnalyticsSectionProps {
  metrics?: VendorDashboardMetrics;
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
 * Vendor analytics, sourced from `/admin/vendor/dashboard?businessId=` — the
 * only endpoint that returns figures scoped to one business.
 *
 * This section previously composed the marketplace dashboard's chart organisms
 * (EarningsChart, RecentOrders, OrdersByLocation, ...). Those all read
 * `/admin/vendor/orders`, which returns EVERY order on the platform with no
 * vendor filter — so a single vendor's page was showing whole-marketplace
 * earnings and orders as though they were theirs. That's real data under the
 * wrong label, which is worse than no data, so they've been removed.
 *
 * TODO(api): per-vendor time series (earnings by month, returns rate, orders by
 * location / product type) need either a vendor-scoped orders endpoint or a
 * `businessId` filter on `/admin/vendor/orders`. The chart components are ready
 * to drop back in once one exists.
 */
export const VendorAnalyticsSection = ({
  metrics,
}: VendorAnalyticsSectionProps) => {
  const grossSales = num(metrics?.grossSales);
  const totalOrders = num(metrics?.totalOrders);
  const totalProducts = num(metrics?.totalProducts);
  const totalCustomers = num(metrics?.totalCustomers);

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
            Performance over time
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-0">
          <ChartEmptyState
            isEmpty
            height={220}
            description="Per-vendor trends need a vendor-scoped orders endpoint; the platform one returns every order with no business filter."
          />
        </CardContent>
      </Card>
    </section>
  );
};

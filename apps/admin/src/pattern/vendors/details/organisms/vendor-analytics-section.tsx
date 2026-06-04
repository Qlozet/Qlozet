'use client';

import { EarningsChart } from '@/pattern/dashboard/organisms/earnings-chart';
import { OrdersByLocation } from '@/pattern/dashboard/organisms/orders-by-location';
import { RecentOrders } from '@/pattern/dashboard/organisms/recent-orders';
import { ReturnsRateChart } from '@/pattern/dashboard/organisms/returns-rate-chart';
import { OrdersByProductTypeChart } from '@/pattern/dashboard/organisms/orders-by-product-type-chart';
import type { VendorDashboardMetrics } from '@/redux/services/dashboard/dashboard.api-slice';
import { formatNaira } from '@/lib/vendors';

interface VendorAnalyticsSectionProps {
  metrics?: VendorDashboardMetrics;
}

// Vendor analytics — composed entirely from existing dashboard chart organisms
// plus the shared DonutChart-backed charts.
export const VendorAnalyticsSection = ({
  metrics,
}: VendorAnalyticsSectionProps) => {
  const grossSales =
    typeof metrics?.grossSales === 'number'
      ? formatNaira(metrics.grossSales)
      : '₦51,000';

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Left column */}
      <div className="space-y-6">
        <EarningsChart grossSales={grossSales} />
        <ReturnsRateChart />
      </div>

      {/* Middle column */}
      <div className="space-y-6">
        <OrdersByLocation />
        <OrdersByProductTypeChart />
      </div>

      {/* Right column */}
      <div className="lg:row-span-1">
        <RecentOrders />
      </div>
    </div>
  );
};

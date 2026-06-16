'use client';

import { EarningsChart } from '@/pattern/dashboard/organisms/earnings-chart';
import { RecentOrders } from '@/pattern/dashboard/organisms/recent-orders';
import { ReturnsRateChart } from '@/pattern/dashboard/organisms/returns-rate-chart';
import { OrdersByProductTypeChart } from '@/pattern/dashboard/organisms/orders-by-product-type-chart';
import type { DonutDatum } from '@/pattern/dashboard/molecules/donut-chart';
import { SessionsByTimeChart } from './sessions-by-time-chart';

// Customer analytics — reuses the dashboard chart organisms (Earnings, Returns
// rate, Orders by product type, Recent orders) plus the customer-specific
// Sessions-by-Time chart, laid out to match the Figma.
const RETURNS_DATA: DonutDatum[] = [
  { name: 'Archived', value: 55 },
  { name: 'Returned', value: 45 },
];

export const CustomerAnalyticsSection = () => {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Left column */}
      <div className="space-y-6">
        <EarningsChart grossSales="51,000" />
        <ReturnsRateChart data={RETURNS_DATA} />
      </div>

      {/* Middle column */}
      <div className="space-y-6">
        <SessionsByTimeChart />
        <OrdersByProductTypeChart />
      </div>

      {/* Right column */}
      <div className="lg:row-span-1">
        <RecentOrders />
      </div>
    </div>
  );
};

'use client';

import { EarningsChart } from '@/pattern/dashboard/organisms/earnings-chart';
import { RecentOrders } from '@/pattern/dashboard/organisms/recent-orders';
import { ReturnsRateChart } from '@/pattern/dashboard/organisms/returns-rate-chart';
import { OrdersByProductTypeChart } from '@/pattern/dashboard/organisms/orders-by-product-type-chart';
import { SessionsByTimeChart } from './sessions-by-time-chart';

// Customer analytics — reuses the dashboard chart organisms (Earnings, Recent
// orders) plus the customer-specific Sessions-by-Time and the Returns rate /
// Orders-by-product-type donuts, laid out to match the design. These are charts
// (the one no-stubbed-data exception) and render representative data until a
// per-customer analytics API exists.
export const CustomerAnalyticsSection = () => {
  return (
    <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
      {/* Left column */}
      <div className='space-y-6'>
        <EarningsChart />
        <ReturnsRateChart />
      </div>

      {/* Middle column */}
      <div className='space-y-6'>
        <SessionsByTimeChart />
        <OrdersByProductTypeChart />
      </div>

      {/* Right column */}
      <div className='lg:row-span-1'>
        <RecentOrders />
      </div>
    </div>
  );
};

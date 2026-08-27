'use client';

import { useMemo } from 'react';
import { readSeries, withoutZeroes } from '@/lib/dashboard-series';
import { useGetCustomerAnalyticsQuery } from '@/redux/services/dashboard/dashboard.api-slice';
import { RecentOrders } from '@/pattern/dashboard/organisms/recent-orders';
import { ReturnsRateChart } from '@/pattern/dashboard/organisms/returns-rate-chart';
import { OrdersByProductTypeChart } from '@/pattern/dashboard/organisms/orders-by-product-type-chart';
import { ChartSkeleton } from '@/pattern/dashboard/molecules/chart-skeleton';
import { ActivityByTimeChart } from './activity-by-time-chart';
import { CustomerSpendChart } from './customer-spend-chart';

interface CustomerAnalyticsSectionProps {
  customerId: string;
}

// Customer analytics, every card scoped to this one customer.
//
// Previously: a dashboard EarningsChart showing platform-wide revenue under a
// hardcoded gross-sales figure, a fabricated 55/45 returns split, an invented
// hourly traffic curve, an empty product-type donut, and a RecentOrders card
// listing the whole marketplace. All of it now comes from
// GET /admin/customer/:id/analytics and a customer-filtered order list.
export const CustomerAnalyticsSection = ({
  customerId,
}: CustomerAnalyticsSectionProps) => {
  // One request feeds the returns and product-type donuts; the spend and
  // activity charts subscribe to the same cache entry through RTK Query.
  const { data, isLoading } = useGetCustomerAnalyticsQuery(
    { customerId },
    { skip: !customerId }
  );
  const charts = data?.data?.charts;

  const returns = useMemo(() => readSeries(charts?.returnsRate), [charts]);
  const productTypes = useMemo(
    () => withoutZeroes(readSeries(charts?.ordersByProductKind)),
    [charts]
  );

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Left column */}
      <div className="space-y-6">
        <CustomerSpendChart customerId={customerId} />
        {isLoading ? (
          <ChartSkeleton />
        ) : (
          <ReturnsRateChart
            data={returns}
            emptyDescription="Returns will chart here once this customer pays for an order."
          />
        )}
      </div>

      {/* Middle column */}
      <div className="space-y-6">
        <ActivityByTimeChart customerId={customerId} />
        {isLoading ? (
          <ChartSkeleton />
        ) : (
          <OrdersByProductTypeChart data={productTypes} />
        )}
      </div>

      {/* Right column */}
      <div className="lg:row-span-1">
        <RecentOrders customerId={customerId} />
      </div>
    </div>
  );
};

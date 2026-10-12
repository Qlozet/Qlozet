'use client';

import { ExpectedEarningsChart } from '../organisms/expected-earnings-chart';
import { RevenueChart } from '../organisms/revenue-chart';
import { OrdersByGender } from '../organisms/orders-by-gender';
import { OrdersByLocation } from '../organisms/orders-by-location';
import { OrdersByProductTypeChart } from '../organisms/orders-by-product-type-chart';
import { OrdersByStatus } from '../organisms/orders-by-status';
import { EarningsChart } from '../organisms/earnings-chart';
import { OrderCountChart } from '../organisms/order-count-chart';
import { RecentOrders } from '../organisms/recent-orders';

export function ChartsSection() {
  return (
    <div className="w-full space-y-6">
      {/* Expected earnings + Revenue over the selected window */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ExpectedEarningsChart />
        </div>
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
      </div>

      {/* Order breakdowns, matching the design's three-up row. */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
        <OrdersByGender />
        <OrdersByProductTypeChart />
        <OrdersByLocation />
      </div>

      {/* Platform commission and order volume over the selected window, plus
          recent orders. Revenue (the card above) is what customers paid;
          platform earnings is the commission the marketplace kept of it. */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
        <EarningsChart />
        <OrderCountChart />
        <RecentOrders />
      </div>

      {/* Status split. Not in the original design, but it is the one breakdown
          the order data supports directly and it replaced a duplicated
          OrdersByLocation card. */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
        <OrdersByStatus />
      </div>
    </div>
  );
}

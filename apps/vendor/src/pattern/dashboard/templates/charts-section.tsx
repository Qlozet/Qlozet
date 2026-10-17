'use client';

import { EarningsChart } from '../organisms/earnings-chart';
import { useVendorAccess } from '@/lib/hooks/use-vendor-access';
import { OrderCountChart } from '../organisms/order-count-chart';
import { OrdersByGender } from '../organisms/orders-by-gender';
import { OrdersByLocation } from '../organisms/orders-by-location';
import { OrdersByProduct } from '../organisms/orders-by-product';
import { RecentOrders } from '../organisms/recent-orders';

export function ChartsSection() {
  const { can: canUse } = useVendorAccess();
  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column */}
      <div className="w-full lg:col-span-1 space-y-6">
        <OrdersByGender />
        {canUse('money.view') && <EarningsChart />}
      </div>

      {/* Middle Column */}
      <div className="w-full lg:col-span-1 space-y-6">
        <OrdersByProduct />
        <OrderCountChart />
      </div>

      {/* Right Column */}
      <div className="lg:col-span-1 space-y-6">
        <OrdersByLocation />
        <RecentOrders />
      </div>
    </div>
  );
}

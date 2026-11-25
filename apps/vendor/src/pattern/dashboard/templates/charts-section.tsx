'use client';

import { EarningsChart } from '../organisms/earnings-chart';
import { useVendorAccess } from '@/lib/hooks/use-vendor-access';
import { OrderCountChart } from '../organisms/order-count-chart';
import { OrdersByGender } from '../organisms/orders-by-gender';
import { OrdersByLocation } from '../organisms/orders-by-location';
import { OrdersByProduct } from '../organisms/orders-by-product';
import { RecentOrders } from '../organisms/recent-orders';

// Earnings leads: it is the wide chart a store owner reads first, with the
// order trend under it. Recent orders sit beside it, and the two "who buys
// what" breakdowns share the row below. Staff who can't see money get the
// order trend as the lead chart instead.
export function ChartsSection() {
  const { can: canUse } = useVendorAccess();
  const seesMoney = canUse('money.view');
  return (
    <div className="w-full space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6 min-w-0">
          {seesMoney ? (
            <>
              <EarningsChart />
              <OrderCountChart height={200} />
            </>
          ) : (
            <OrderCountChart />
          )}
        </div>
        <div className="space-y-6 min-w-0">
          <RecentOrders />
          <OrdersByLocation />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <OrdersByProduct />
        <OrdersByGender />
      </div>
    </div>
  );
}

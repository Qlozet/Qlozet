'use client';

import type { ReactNode } from 'react';
import { ShoppingCart, Send, Truck, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { APP_ROUTES } from '@/lib/routes';
import { formatChange } from '@/lib/orders';
import { MetricCard } from '@/pattern/common/molecules/metric-card';
import { StatsCardSkeleton } from '@/pattern/dashboard/molecules/stats-card-skeleton';
import {
  useGetAdminDashboardQuery,
  type MustPurchaseProduct,
} from '@/redux/services/dashboard/dashboard.api-slice';
import { useGetProductQuery } from '@/redux/services/products/products.api-slice';

const CardIcon = ({ bg, children }: { bg: string; children: ReactNode }) => (
  <div
    className={cn(
      'flex size-12 items-center justify-center rounded-[10px] text-white',
      bg
    )}
  >
    {children}
  </div>
);

const formatCount = (value: number | undefined): string =>
  typeof value === 'number' ? value.toLocaleString() : '—';

/**
 * Highest-selling entry of `must_purchase_products`.
 *
 * Returns undefined when nothing in the list has actually been ordered — a
 * product with `totalOrdered: 0` is not "most purchased", and labelling it so
 * would put a name on the card that no sale supports.
 */
const topPurchased = (
  products: MustPurchaseProduct[] | undefined
): MustPurchaseProduct | undefined => {
  if (!Array.isArray(products)) return undefined;
  let top: MustPurchaseProduct | undefined;
  for (const product of products) {
    const ordered = product?.totalOrdered;
    if (typeof ordered !== 'number' || ordered <= 0) continue;
    if (!top || ordered > top.totalOrdered) top = product;
  }
  return top;
};

// Overview breakdown for the Orders page, read straight from
// GET /admin/dashboard. These are platform-wide, all-time figures: the endpoint
// takes no parameters, so the page's period filter narrows the table only —
// hence the "all time" sub-label on each card, so the numbers aren't misread as
// belonging to the selected period.
export const OrderStatsCards = () => {
  const { data, isLoading } = useGetAdminDashboardQuery();
  const metrics = data?.data;
  const changes = metrics?.changes;

  // The payload names the product itself; the lookup is the fallback for
  // deployments that still send the id alone.
  const top = topPurchased(metrics?.must_purchase_products);
  const needsLookup = Boolean(top?.product_id) && !top?.name;
  const { data: productData } = useGetProductQuery(
    needsLookup ? (top?.product_id ?? '') : '',
    { skip: !needsLookup }
  );
  const productName = top?.name ?? productData?.data?.name;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Total Orders"
        subLabel="all time"
        value={formatCount(metrics?.total_orders)}
        change={formatChange(changes?.total_orders)}
        icon={
          <CardIcon bg="bg-[#57CAEB]">
            <ShoppingCart className="size-6" />
          </CardIcon>
        }
        viewAllLink={APP_ROUTES.orders}
      />
      <MetricCard
        title="Orders Delivered"
        subLabel="all time"
        value={formatCount(metrics?.orders_delivered)}
        change={formatChange(changes?.orders_delivered)}
        icon={
          <CardIcon bg="bg-[#5DDAB4]">
            <Send className="size-6" />
          </CardIcon>
        }
      />
      <MetricCard
        title="Orders in Transit"
        subLabel="all time"
        value={formatCount(metrics?.orders_in_transit)}
        change={formatChange(changes?.orders_in_transit)}
        icon={
          <CardIcon bg="bg-[#FF8F6B]">
            <Truck className="size-6" />
          </CardIcon>
        }
      />
      <MetricCard
        title="Most purchased order"
        subLabel="all time"
        // Needs both a sold product in the list and a resolvable name; show a
        // neutral dash rather than inventing one.
        value={productName ?? '—'}
        // A product name, not a figure: the 2xl the numeric cards use overflows
        // the card on anything longer than a word or two. Smaller, and allowed
        // to wrap onto a second line before it truncates.
        valueClassName="text-base leading-snug line-clamp-2 break-words"
        // No change badge here. The design shows one, but a percentage
        // movement on a product NAME has no meaning — the value is not a
        // quantity, and the endpoint has no trend for it.
        icon={
          <CardIcon bg="bg-[#57CAEB]">
            <ShoppingBag className="size-6" />
          </CardIcon>
        }
      />
    </div>
  );
};

'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import NiceModal from '@ebay/nice-modal-react';
import { ChevronRight, PackageX, ShoppingBag, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { APP_ROUTES } from '@/lib/routes';
import {
  formatNaira,
  orderStatusBadge,
  readAmountPaid,
  readCustomerName,
  readFirstProductName,
  readItemImage,
  readOrderId,
  readStatus,
  timeAgo,
} from '@/lib/orders';
import {
  useGetAdminOrdersQuery,
  type AdminOrder,
} from '@/redux/services/orders/orders.api-slice';
import { OrderDetailsDrawer } from '@/pattern/orders/organisms/order-details-drawer';
import { ChartSkeleton } from '../molecules/chart-skeleton';

const MAX_ROWS = 5;
const MAX_THUMBS = 3;

const orderThumbnails = (order: AdminOrder): string[] =>
  (order.items ?? [])
    .map(readItemImage)
    .filter((src): src is string => Boolean(src))
    .slice(0, MAX_THUMBS);

interface RecentOrdersProps {
  /**
   * Narrow to one buyer's orders. The customer detail page passes this —
   * without it that page's "Recent orders" card listed the whole marketplace's
   * orders on a page about one person.
   */
  customerId?: string;
}

export const RecentOrders = ({ customerId }: RecentOrdersProps = {}) => {
  // Ask for exactly the rows this card shows. `/admin/vendor/orders` is
  // paginated — it defaults to 10 and sorts newest-first server-side — so
  // calling it bare fetched a page and a half of orders to render five. The
  // sort below is kept as a guard: it costs nothing on five rows and keeps the
  // card correct if the server-side ordering ever changes.
  const { data, isLoading } = useGetAdminOrdersQuery({
    page: 1,
    size: MAX_ROWS,
    ...(customerId ? { customerId } : {}),
  });

  const orders = useMemo(
    () =>
      [...(data?.data ?? [])]
        .sort(
          (a, b) =>
            new Date(b.createdAt ?? 0).getTime() -
            new Date(a.createdAt ?? 0).getTime()
        )
        .slice(0, MAX_ROWS),
    [data]
  );

  if (isLoading) return <ChartSkeleton />;

  const isEmpty = orders.length === 0;

  return (
    <Card className="flex w-full h-[443px] flex-col overflow-hidden rounded-[12px] custom-card-shadow">
      <CardHeader className="flex shrink-0 flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <ShoppingBag className="size-4 text-muted-foreground" />
          <CardTitle className="m-0 text-sm font-medium text-[hsla(210,9%,31%,1)] dark:text-white">
            Recent orders
          </CardTitle>
          {!isEmpty && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
              {orders.length}
            </span>
          )}
        </div>
        <Link
          href={APP_ROUTES.orders}
          className="flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80"
        >
          View all <ChevronRight size={14} />
        </Link>
      </CardHeader>

      <CardContent className="min-h-0 flex-1 space-y-2 overflow-y-auto pb-4">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <PackageX
              size={32}
              strokeWidth={1.5}
              className="text-muted-foreground"
            />
            <div className="flex flex-col items-center gap-1.5">
              <p className="text-base font-medium text-muted-foreground">
                Nothing in here yet.
              </p>
              <p className="text-center text-sm text-muted-foreground">
                Recent orders will show up here as customers place them
              </p>
            </div>
          </div>
        ) : (
          orders.map((order) => {
            const productName =
              readFirstProductName(order) ?? readOrderId(order);
            const images = orderThumbnails(order);
            const itemsCount = order.items?.length ?? 0;
            const badge = orderStatusBadge(readStatus(order));
            const orderId = readOrderId(order);

            return (
              <button
                type="button"
                key={order._id}
                onClick={() => NiceModal.show(OrderDetailsDrawer, { order })}
                className="group flex w-full cursor-pointer items-center justify-between rounded-xl bg-gray-50 dark:bg-muted p-3 text-left transition hover:bg-gray-100 dark:hover:bg-muted/80"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  {/* Thumbnail stack — tight by default, fans out on hover. */}
                  <div className="flex shrink-0 items-center">
                    {images.length > 0 ? (
                      images.map((src, index) => (
                        <div
                          key={index}
                          className={cn(
                            'relative size-11 overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700 ring-2 ring-gray-50 dark:ring-muted transition-all duration-200 ease-out',
                            index !== 0 && '-ml-8 group-hover:-ml-4'
                          )}
                          style={{ zIndex: images.length - index }}
                        >
                          <Image
                            src={src}
                            alt={productName}
                            fill
                            className="object-cover"
                            sizes="44px"
                            unoptimized
                          />
                        </div>
                      ))
                    ) : (
                      <div className="relative flex size-11 items-center justify-center overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700">
                        <Package className="size-4 text-gray-400" />
                      </div>
                    )}
                  </div>

                  <div className="flex min-w-0 flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-gray-900 dark:text-white transition-colors group-hover:text-primary">
                        {productName}
                      </p>
                      {itemsCount > 1 && (
                        <span className="shrink-0 text-[10px] text-muted-foreground">
                          +{itemsCount - 1} more
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                        {readCustomerName(order)}
                      </p>
                      <span className="text-gray-300 dark:text-gray-600">
                        &middot;
                      </span>
                      <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                        #{orderId.slice(-6).toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="ml-3 flex shrink-0 items-center gap-3">
                  <div className="flex flex-col items-end gap-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatNaira(readAmountPaid(order))}
                    </p>
                    <span
                      className={cn(
                        'inline-flex h-[20px] items-center justify-center whitespace-nowrap rounded-md px-2 text-[10px] font-medium',
                        badge.className
                      )}
                    >
                      {badge.label}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] text-muted-foreground">
                      {timeAgo(order.createdAt)}
                    </span>
                    <ChevronRight
                      size={14}
                      className="text-gray-400 transition-colors group-hover:text-primary"
                    />
                  </div>
                </div>
              </button>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};

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
} from '@/lib/orders';
import {
  useGetAdminOrdersQuery,
  type AdminOrder,
} from '@/redux/services/orders/orders.api-slice';
import { OrderDetailsDrawer } from '@/pattern/orders/organisms/order-details-drawer';
import { ChartSkeleton } from '../molecules/chart-skeleton';

const MAX_ROWS = 5;
const MAX_THUMBS = 3;

/** Relative time string (e.g. "2h ago", "3d ago"). */
const timeAgo = (value?: string): string => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

const orderThumbnails = (order: AdminOrder): string[] =>
  (order.items ?? [])
    .map(readItemImage)
    .filter((src): src is string => Boolean(src))
    .slice(0, MAX_THUMBS);

export const RecentOrders = () => {
  const { data, isLoading } = useGetAdminOrdersQuery();

  // The endpoint returns every order and newest-first isn't guaranteed, so sort
  // before taking the top few.
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
          <CardTitle className="m-0 text-sm font-medium text-[hsla(210,9%,31%,1)]">
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
                className="group flex w-full cursor-pointer items-center justify-between rounded-xl bg-gray-50 p-3 text-left transition hover:bg-gray-100"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  {/* Thumbnail stack — tight by default, fans out on hover. */}
                  <div className="flex shrink-0 items-center">
                    {images.length > 0 ? (
                      images.map((src, index) => (
                        <div
                          key={index}
                          className={cn(
                            'relative size-11 overflow-hidden rounded-lg bg-gray-200 ring-2 ring-gray-50 transition-all duration-200 ease-out',
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
                      <div className="relative flex size-11 items-center justify-center overflow-hidden rounded-lg bg-gray-200">
                        <Package className="size-4 text-gray-400" />
                      </div>
                    )}
                  </div>

                  <div className="flex min-w-0 flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-gray-900 transition-colors group-hover:text-primary">
                        {productName}
                      </p>
                      {itemsCount > 1 && (
                        <span className="shrink-0 text-[10px] text-muted-foreground">
                          +{itemsCount - 1} more
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="truncate text-xs text-gray-500">
                        {readCustomerName(order)}
                      </p>
                      <span className="text-gray-300">&middot;</span>
                      <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                        #{orderId.slice(-6).toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="ml-3 flex shrink-0 items-center gap-3">
                  <div className="flex flex-col items-end gap-1">
                    <p className="text-sm font-semibold text-gray-900">
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

'use client';

import React from 'react';
import Image from 'next/image';
import NiceModal from '@ebay/nice-modal-react';
import { ChevronRight, Package, ShoppingBag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { APP_ROUTES } from '@/lib/routes';
import {
  useGetVendorOrdersQuery,
  type Order,
} from '@/redux/services/orders/orders.api-slice';
import { ChartSkeleton } from '../molecules/chart-skeleton';
import { BoldBoxRemoveIcon } from '@/pattern/common/atoms/bold-box-remove-icon';
import { OrderDetailsDrawer } from '@/pattern/orders/organisms/order-details-drawer';
import {
  readAmountPaid,
  readCustomerName,
  readItemsCount,
  readOrderId,
  readOrderItemImages,
  readOrderTitle,
  readStatus,
  orderStatusBadge,
  formatNaira,
} from '@/pattern/orders/lib/order-fields';
import { useAppSelector } from '@/redux/store';
import { selectActiveBusiness } from '@/redux/slices/auth-slice';
import { cn } from '@/lib/utils';

/* ── Helpers ── */

/** Relative time string (e.g. "2h ago", "3d ago") */
function timeAgo(dateStr?: string): string {
  if (!dateStr) return '\u2014';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '\u2014';
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

/* ── Component ── */

export const RecentOrders = () => {
  // Active vendor business — scopes each row to this vendor's items so a shared
  // multi-vendor order doesn't surface another vendor's product/amount.
  const businessId = useAppSelector(selectActiveBusiness)?._id ?? '';
  const { data: ordersResponse, isLoading } = useGetVendorOrdersQuery({
    page: 1,
    size: 5,
  });

  // Safely extract orders array from response
  const raw = ordersResponse as any;
  const orders: Order[] = Array.isArray(raw?.data)
    ? raw.data
    : Array.isArray(raw?.data?.data)
      ? raw.data.data
      : raw?.data
        ? (Object.values(raw.data).filter(
            (v: any) => v && typeof v === 'object' && v._id
          ) as Order[])
        : [];

  if (isLoading) {
    return <ChartSkeleton />;
  }

  const isEmpty = orders.length === 0;

  const handleOrderClick = (order: Order) => {
    NiceModal.show(OrderDetailsDrawer, { order });
  };

  return (
    <Card className="w-full h-[443px] overflow-hidden rounded-[12px] custom-card-shadow flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-3 shrink-0">
        <div className="flex items-center gap-2">
          <ShoppingBag className="size-4 text-muted-foreground" />
          <CardTitle className="text-sm font-medium text-foreground m-0">
            Recent orders
          </CardTitle>
          {!isEmpty && (
            <span className="text-xs text-muted-foreground tabular-nums">
              {orders.length}
            </span>
          )}
        </div>
        <Link
          href={APP_ROUTES.orders}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          View orders <ChevronRight size={14} />
        </Link>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 overflow-y-auto space-y-2 pb-4">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <div className="scale-75">
              <BoldBoxRemoveIcon />
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <p className="text-base font-medium text-muted-foreground">
                Nothing in here yet.
              </p>
              <p className="text-sm text-muted-foreground text-center">
                Your recent orders will show up here as customers place them
              </p>
            </div>
          </div>
        ) : (
          orders.map((order: Order, idx: number) => {
            const productName = readOrderTitle(order, businessId);
            const images = readOrderItemImages(order, 3, businessId);
            const customerName = readCustomerName(order);
            const total =
              readAmountPaid(order, businessId) ??
              order.total ??
              order.subtotal ??
              0;
            const status = readStatus(order);
            const badge = orderStatusBadge(status);
            const itemsCount = readItemsCount(order, businessId);
            const orderId = readOrderId(order);

            return (
              <button
                type="button"
                key={order._id || idx}
                onClick={() => handleOrderClick(order)}
                className="w-full flex items-center justify-between p-3 bg-muted/50 hover:bg-muted rounded-[8px] transition-colors group text-left cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Product thumbnail stack (overlapping for multi-item orders) */}
                  <div className="flex shrink-0 items-center">
                    {images.length > 0 ? (
                      images.map((src, i) => (
                        <div
                          key={i}
                          className={cn(
                            'relative size-11 rounded-lg overflow-hidden bg-muted ring-2 ring-card',
                            // Overlapping, so several items read as one stack.
                            i !== 0 && '-ml-8'
                          )}
                          style={{ zIndex: images.length - i }}
                        >
                          <Image
                            src={src}
                            alt={productName}
                            fill
                            className="object-cover"
                            sizes="44px"
                          />
                        </div>
                      ))
                    ) : (
                      <div className="relative size-11 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <Package className="size-4 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Order info */}
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-foreground truncate group-hover:text-primary transition-colors">
                        {productName}
                      </p>
                      {itemsCount > 1 && (
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          +{itemsCount - 1} more
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground truncate">
                        {customerName}
                      </p>
                      <span className="text-muted-foreground/50">&middot;</span>
                      <span className="text-xs text-muted-foreground font-mono shrink-0">
                        #{orderId.slice(-6).toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <div className="flex flex-col items-end gap-1">
                    <p className="text-sm font-medium text-foreground tabular-nums">
                      {formatNaira(total)}
                    </p>
                    <span
                      className={cn(
                        'inline-flex h-5 items-center justify-center whitespace-nowrap rounded-md px-2 text-[11px] font-medium',
                        badge.className
                      )}
                    >
                      {badge.label}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[11px] text-muted-foreground tabular-nums">
                      {timeAgo(order.createdAt)}
                    </span>
                    <ChevronRight
                      size={14}
                      className="text-muted-foreground group-hover:text-foreground transition-colors"
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

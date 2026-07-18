"use client"

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
    type PopulatedProduct,
} from '@/redux/services/orders/orders.api-slice';
import { ChartSkeleton } from '../molecules/chart-skeleton';
import { BoldBoxRemoveIcon } from '@/pattern/common/atoms/bold-box-remove-icon';
import { OrderDetailsDrawer } from '@/pattern/orders/organisms/order-details-drawer';
import {
    readCustomerName,
    readOrderId,
    readStatus,
    orderStatusBadge,
    formatNaira,
} from '@/pattern/orders/lib/order-fields';
import { cn } from '@/lib/utils';

/* ── Helpers ── */

/** Get product name from an order's first item */
function getFirstProductName(order: Order): string {
    const item = order.items?.[0];
    if (!item) return 'Order';
    const product = typeof item.product === 'object' && item.product !== null
        ? (item.product as PopulatedProduct)
        : null;
    if (!product) return 'Order';
    return product.clothing?.name
        ?? product.fabric?.name
        ?? product.accessory?.name
        ?? product.name
        ?? 'Order';
}

/** Get first product image URL from an order */
function getFirstProductImage(order: Order): string | null {
    const item = order.items?.[0];
    if (!item) return null;
    const product = typeof item.product === 'object' && item.product !== null
        ? (item.product as PopulatedProduct)
        : null;
    if (!product) return null;

    const kindImages =
        product.clothing?.images ??
        product.fabric?.images ??
        product.accessory?.images;
    if (kindImages?.length) {
        const first = kindImages[0];
        if (typeof first === 'object' && first?.url) return first.url;
    }

    if (product.images?.length) {
        const first = product.images[0];
        if (typeof first === 'string') return first;
        if (typeof first === 'object' && first?.url) return first.url;
    }
    return null;
}

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
    const { data: ordersResponse, isLoading } = useGetVendorOrdersQuery({ page: 1, size: 5 });

    // Safely extract orders array from response
    const raw = ordersResponse as any;
    const orders: Order[] = Array.isArray(raw?.data)
        ? raw.data
        : Array.isArray(raw?.data?.data)
            ? raw.data.data
            : (raw?.data ? Object.values(raw.data).filter((v: any) => v && typeof v === 'object' && v._id) as Order[] : []);

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
                    <CardTitle className="text-sm font-medium text-[hsla(210,9%,31%,1)] dark:text-foreground m-0">
                        Recent orders
                    </CardTitle>
                    {!isEmpty && (
                        <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-semibold">
                            {orders.length}
                        </span>
                    )}
                </div>
                <Link href={APP_ROUTES.orders} className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium transition-colors">
                    View all <ChevronRight size={14} />
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
                        const productName = getFirstProductName(order);
                        const imageUrl = getFirstProductImage(order);
                        const customerName = readCustomerName(order);
                        const total = order.total ?? order.subtotal ?? 0;
                        const status = readStatus(order);
                        const badge = orderStatusBadge(status);
                        const itemsCount = Array.isArray(order.items) ? order.items.length : 0;
                        const orderId = readOrderId(order);

                        return (
                            <button
                                type="button"
                                key={order._id || idx}
                                onClick={() => handleOrderClick(order)}
                                className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 dark:bg-muted dark:hover:bg-muted/80 rounded-xl transition group text-left"
                            >
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    {/* Product thumbnail */}
                                    <div className="relative size-11 rounded-lg shrink-0 overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                        {imageUrl ? (
                                            <Image
                                                src={imageUrl}
                                                alt={productName}
                                                fill
                                                className="object-cover"
                                                sizes="44px"
                                            />
                                        ) : (
                                            <Package className="size-4 text-gray-400" />
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
                                            <p className="text-xs text-gray-500 dark:text-muted-foreground truncate">
                                                {customerName}
                                            </p>
                                            <span className="text-gray-300 dark:text-gray-600">&middot;</span>
                                            <span className="text-[11px] text-muted-foreground font-mono shrink-0">
                                                #{orderId.slice(-6).toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right side */}
                                <div className="flex items-center gap-3 shrink-0 ml-3">
                                    <div className="flex flex-col items-end gap-1">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-foreground">
                                            {formatNaira(total)}
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
                                        <ChevronRight size={14} className="text-gray-400 dark:text-muted-foreground group-hover:text-primary transition-colors" />
                                    </div>
                                </div>
                            </button>
                        );
                    })
                )}
            </CardContent>
        </Card>
    );
}
"use client"

import { ChevronRight, Package } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { APP_ROUTES } from '@/lib/routes';
import {
    formatNaira,
    formatOrderDate,
    readAmountPaid,
    readCustomerName,
    readFirstProductName,
    readOrderId,
} from '@/lib/orders';
import { useGetAdminOrdersQuery } from '@/redux/services/orders/orders.api-slice';

const MAX_ROWS = 3;

const RecentOrdersSkeleton = () => (
    <div className="space-y-3">
        {Array.from({ length: MAX_ROWS }).map((_, i) => (
            <div
                key={i}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
                <div className="flex items-center gap-3">
                    <Skeleton className="size-11 rounded-md" />
                    <div className="flex flex-col gap-1.5">
                        <Skeleton className="h-4 w-28 rounded-md" />
                        <Skeleton className="h-3 w-20 rounded-md" />
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end gap-1.5">
                        <Skeleton className="h-4 w-20 rounded-md" />
                        <Skeleton className="h-3 w-16 rounded-md" />
                    </div>
                    <Skeleton className="size-7 rounded-full" />
                </div>
            </div>
        ))}
    </div>
);

export const RecentOrders = () => {
    const { data, isLoading } = useGetAdminOrdersQuery();

    // The endpoint returns every order, newest first is not guaranteed — sort
    // by creation date before taking the top few.
    const orders = [...(data?.data ?? [])]
        .sort(
            (a, b) =>
                new Date(b.createdAt ?? 0).getTime() -
                new Date(a.createdAt ?? 0).getTime()
        )
        .slice(0, MAX_ROWS);

    return (
        <Card className="w-full h-[443px] overflow-y-auto rounded-[12px] custom-card-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-sm font-medium text-[hsla(210,9%,31%,1)] m-0">
                    Recent orders
                </CardTitle>
                <Link
                    href={APP_ROUTES.orders}
                    className="flex items-center gap-1 text-xs text-foreground"
                >
                    View all <ChevronRight size={16} />
                </Link>
            </CardHeader>
            <CardContent className="space-y-3">
                {isLoading && <RecentOrdersSkeleton />}

                {!isLoading && orders.length === 0 && (
                    <p className="py-16 text-center text-sm text-muted-foreground">
                        No orders yet.
                    </p>
                )}

                {!isLoading &&
                    orders.map((order) => (
                        <Link
                            key={order._id}
                            href={APP_ROUTES.orders}
                            className="group flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-gray-200">
                                    <Package className="size-4 text-gray-500" />
                                </div>
                                <div className="flex flex-col gap-0.5 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {readFirstProductName(order) ?? readOrderId(order)}
                                    </p>
                                    <p className="text-xs text-gray-600 truncate">
                                        {readCustomerName(order)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                                <div className="flex flex-col items-end gap-0.5">
                                    <p className="text-sm font-semibold text-gray-900">
                                        {formatNaira(readAmountPaid(order))}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {formatOrderDate(order.createdAt)}
                                    </p>
                                </div>
                                <span className="p-1.5 bg-gray-200 group-hover:bg-gray-300 rounded-full transition">
                                    <ChevronRight size={16} className="text-gray-600" />
                                </span>
                            </div>
                        </Link>
                    ))}
            </CardContent>
        </Card>
    );
}

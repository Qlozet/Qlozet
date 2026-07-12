"use client"

import { ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { APP_ROUTES } from '@/lib/routes';
import { useGetVendorOrdersQuery } from '@/redux/services/orders/orders.api-slice';
import { ChartSkeleton } from '../molecules/chart-skeleton';
import { BoldBoxRemoveIcon } from '@/pattern/common/atoms/bold-box-remove-icon';

const BG_COLORS = ["bg-[#7c3a3a]", "bg-[#2f6e64]", "bg-[#3d2817]"];

export const RecentOrders = () => {
    const { data: ordersResponse, isLoading } = useGetVendorOrdersQuery({ page: 1, size: 3 });
    const raw = ordersResponse as any;
    const orders: any[] = Array.isArray(raw?.data)
        ? raw.data
        : Array.isArray(raw?.data?.data)
            ? raw.data.data
            : [];

    if (isLoading) {
        return <ChartSkeleton />;
    }

    const isEmpty = orders.length === 0;

    return (
        <Card className="w-full h-[443px] overflow-y-auto rounded-[12px] custom-card-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-sm font-medium text-[hsla(210,9%,31%,1)] dark:text-foreground m-0">
                    Recent orders
                </CardTitle>
                <Link href={APP_ROUTES.orders} className="flex items-center gap-1 text-xs text-foreground">
                    View all <ChevronRight size={16} />
                </Link>
            </CardHeader>
            <CardContent className="space-y-3">
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
                    orders.map((order: any, idx: number) => {
                        const productName = typeof order.items?.[0]?.product === 'object' 
                            ? order.items[0].product.name 
                            : 'Order';
                        const customerName = typeof order.customer === 'object'
                            ? `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim() || order.customer.email
                            : '';
                        const total = order.total ?? order.subtotal ?? 0;

                        return (
                            <div
                                key={order._id || idx}
                                className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 dark:bg-muted dark:hover:bg-muted/80 rounded-[12px] transition"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`size-11 rounded-md shrink-0 ${BG_COLORS[idx % BG_COLORS.length]}`} />
                                    <div className="flex flex-col gap-0.5">
                                        <p className="text-sm font-medium text-gray-900 dark:text-foreground">{productName}</p>
                                        <p className="text-xs text-gray-600 dark:text-muted-foreground">{customerName}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex flex-col items-end gap-0.5">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-foreground">₦{total.toLocaleString()}</p>
                                        <p className="text-xs text-gray-500 dark:text-muted-foreground">
                                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '—'}
                                        </p>
                                    </div>
                                    <button className="p-1.5 bg-gray-200 hover:bg-gray-300 dark:bg-muted dark:hover:bg-secondary rounded-full transition">
                                        <ChevronRight size={16} className="text-gray-600 dark:text-muted-foreground" />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </CardContent>
        </Card>
    );
}
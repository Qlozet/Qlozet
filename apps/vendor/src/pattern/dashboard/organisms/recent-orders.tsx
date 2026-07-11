"use client"

import { ChevronRight, ShoppingBag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { APP_ROUTES } from '@/lib/routes';
import { useGetVendorOrdersQuery } from '@/redux/services/orders/orders.api-slice';
import { ChartSkeleton } from '../molecules/chart-skeleton';

const BG_COLORS = ["bg-[#7c3a3a]", "bg-[#2f6e64]", "bg-[#3d2817]"];

const PLACEHOLDER_ORDERS = [
    { name: "Silk Evening Dress", customer: "Jane D.", price: "₦45,000", date: "Today" },
    { name: "Ankara Print Blazer", customer: "Michael O.", price: "₦32,500", date: "Yesterday" },
    { name: "Custom Agbada Set", customer: "Chidi N.", price: "₦68,000", date: "2 days ago" },
    { name: "Lace Blouse", customer: "Amara K.", price: "₦18,200", date: "3 days ago" },
    { name: "Denim Jacket", customer: "Bola T.", price: "₦27,800", date: "4 days ago" },
];

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
                    <div className="relative">
                        {/* Ghost placeholder rows */}
                        <div className="opacity-[0.35] pointer-events-none select-none space-y-3" aria-hidden="true">
                            {PLACEHOLDER_ORDERS.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-muted rounded-[12px]"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`size-11 rounded-md shrink-0 ${BG_COLORS[idx % BG_COLORS.length]}`} />
                                        <div className="flex flex-col gap-0.5">
                                            <p className="text-sm font-medium text-gray-900 dark:text-foreground">{item.name}</p>
                                            <p className="text-xs text-gray-600 dark:text-muted-foreground">{item.customer}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex flex-col items-end gap-0.5">
                                            <p className="text-sm font-semibold text-gray-900 dark:text-foreground">{item.price}</p>
                                            <p className="text-xs text-gray-500 dark:text-muted-foreground">{item.date}</p>
                                        </div>
                                        <div className="p-1.5 bg-gray-200 dark:bg-muted rounded-full">
                                            <ChevronRight size={16} className="text-gray-600 dark:text-muted-foreground" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Centered overlay */}
                        <div className="absolute inset-0 flex items-center justify-center z-10">
                            <div className="text-center px-4 max-w-[220px]">
                                <div className="mx-auto mb-2 flex items-center justify-center">
                                    <ShoppingBag
                                        size={28}
                                        className="text-muted-foreground/60 animate-pulse"
                                        strokeWidth={1.5}
                                    />
                                </div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    No orders yet
                                </p>
                                <p className="text-xs text-muted-foreground/70 mt-1 leading-relaxed">
                                    Your recent orders will show up here as customers place them
                                </p>
                            </div>
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
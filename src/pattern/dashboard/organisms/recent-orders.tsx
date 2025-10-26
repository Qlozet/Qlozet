"use client"

import { ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { APP_ROUTES } from '@/lib/routes';

const orders = [
    {
        id: 1,
        orderId: "D34554ADF",
        customerName: "Omowyi Precious",
        amount: "₦20,000",
        date: "23/03/2023",
        image: "👜",
    },
    {
        id: 2,
        orderId: "C8D1234DF",
        customerName: "Omowyi Precious",
        amount: "₦20,000",
        date: "23/03/2023",
        image: "👗",
    },
    {
        id: 3,
        orderId: "D34554ADF",
        customerName: "Omowyi Precious",
        amount: "₦20,000",
        date: "23/03/2023",
        image: "👟",
    }
]

export const RecentOrders = () => {
    return (
        <Card className="w-full h-[443px] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-sm font-medium text-[hsla(210,9%,31%,1)] m-0">
                    Recent orders
                </CardTitle>
                <Link href={APP_ROUTES.orders} className="flex items-center gap-1 text-xs text-foreground">
                    View all <ChevronRight size={16} />
                </Link>
            </CardHeader>
            <CardContent className="space-y-3">
                {orders.map((order) => (
                    <div
                        key={order.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                    >
                        <div className="flex items-center gap-4">
                            {order.image}
                            <div className="flex flex-col gap-1">
                                <p className="text-sm font-medium text-gray-900">{order.orderId}</p>
                                <p className="text-xs text-gray-600">{order.customerName}</p>
                                <p className="text-xs text-gray-500">{order.date}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <p className="text-sm font-semibold text-gray-900">{order.amount}</p>
                            <button className="p-2 hover:bg-gray-200 rounded-lg transition">
                                <ChevronRight size={18} className="text-gray-600" />
                            </button>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
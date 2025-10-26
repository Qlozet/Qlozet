"use client"

import { EarningsChart } from "../organisms/earnings-chart"
import { OrderCountChart } from "../organisms/order-count-chart"
import { OrdersByGender } from "../organisms/orders-by-gender"
import { OrdersByLocation } from "../organisms/orders-by-location"
import { OrdersByProduct } from "../organisms/orders-by-product"
import { RecentOrders } from "../organisms/recent-orders"

export function ChartsSection() {
    return (
        <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="w-full lg:col-span-1 space-y-6">
                <OrdersByGender />
                <EarningsChart />
            </div>

            {/* Middle Column */}
            <div className="w-full lg:col-span-1 space-y-6">
                <OrdersByLocation />
                <OrderCountChart />
            </div>

            {/* Right Column */}
            <div className="lg:col-span-1 space-y-6">
                <OrdersByProduct />
                <RecentOrders />
            </div>
        </div>
    )
}

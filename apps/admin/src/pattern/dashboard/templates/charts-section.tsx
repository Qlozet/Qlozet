"use client"

import { ExpectedEarningsChart } from "../organisms/expected-earnings-chart"
import { MonthlyRevenueChart } from "../organisms/monthly-revenue-chart"
import { OrdersByGender } from "../organisms/orders-by-gender"
import { OrdersByLocation } from "../organisms/orders-by-location"
import { EarningsChart } from "../organisms/earnings-chart"
import { OrderCountChart } from "../organisms/order-count-chart"
import { RecentOrders } from "../organisms/recent-orders"

export function ChartsSection() {
    return (
        <div className="w-full space-y-6">
            {/* Expected earnings + Monthly revenue */}
            <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <ExpectedEarningsChart />
                </div>
                <div className="lg:col-span-2">
                    <MonthlyRevenueChart />
                </div>
            </div>

            {/* Orders breakdowns */}
            <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
                <OrdersByGender />
                <OrdersByLocation />
                <OrdersByLocation />
            </div>

            {/* Earnings, order count, recent orders */}
            <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
                <EarningsChart />
                <OrderCountChart />
                <RecentOrders />
            </div>
        </div>
    )
}

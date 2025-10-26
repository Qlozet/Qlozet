"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetDailyOrdersQuery, useGetOrdersQuery } from "@/redux/services/dashboard/dashboard.api-slice";
import { ChartSkeleton } from "../molecules/chart-skeleton";
import { CustomYAxisTick } from '../molecules/custom-y-axis-tick';
import { CustomXAxisTick } from '../molecules/custom-x-axis-tick';

const chartData = [
    { day: "Sun", earnings: 35000 },
    { day: "Mon", earnings: 39000 },
    { day: "Tue", earnings: 29000 },
    { day: "Wed", earnings: 51000 },
    { day: "Thu", earnings: 39000 },
    { day: "Fri", earnings: 24000 },
    { day: "Sat", earnings: 12000 },
];

export const OrderCountChart = () => {
    // Get Orders API Query
    const { data: ordersData, isLoading: ordersLoading } = useGetOrdersQuery();

    // Daily Orders API Query
    const { data: dailyOrdersData, isLoading: dailyOrdersLoading } =
        useGetDailyOrdersQuery({ filter: 'thisMonth' });

    if (dailyOrdersLoading || ordersLoading) {
        return <ChartSkeleton />;
    }

    return (
        <Card className="w-full max-h-[450px]">
            <CardHeader>
                <CardTitle className="text-sm font-medium text-[hsla(210,9%,31%,1)]">Order Count</CardTitle>
            </CardHeader>
            <CardContent className='w-full'>
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart
                        data={chartData}
                        barGap={2}
                        margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="0" vertical={false} stroke="#e5e7eb" />
                        <XAxis
                            dataKey="day"
                            tick={<CustomXAxisTick />}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            tick={<CustomYAxisTick />}
                            axisLine={false}
                            tickLine={false}
                            domain={[0, 60000]}
                            ticks={[0, 10000, 20000, 30000, 40000, 50000, 60000]}
                        />
                        <Bar
                            dataKey="earnings"
                            fill="#c4b5a0"
                            maxBarSize={24}
                            radius={[2.26, 2.26, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}

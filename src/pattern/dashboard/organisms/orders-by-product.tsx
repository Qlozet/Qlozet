"use client"

import { useGetTopProductsQuery } from "@/redux/services/dashboard/dashboard.api-slice";
import { ChartSkeleton } from "../molecules/chart-skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CustomChartTooltip } from "../molecules/custom-chart-tooltip";

const chartData = [
    { label: "AMASI QUEEN DRE...", male: 50, female: 30 },
    { label: "MAISON DE VETEMENTS ...", male: 40, female: 25 },
    { label: "MOTORSPORT RU...", male: 30, female: 20 },
    { label: "WARM CASUAL", male: 25, female: 15 },
]

export const OrdersByProduct = () => {
    // Top Products API Query
    const { data: productsData, isLoading: productsLoading } = useGetTopProductsQuery();

    if (productsLoading) {
        return <ChartSkeleton />;
    }

    return (
        <Card className="w-full max-h-[330px]">
            <CardHeader className="px-6 pb-4">
                <CardTitle className="text-sm font-medium text-[hsla(210,9%,31%,1)]">
                    Orders by product
                </CardTitle>
            </CardHeader>
            <CardContent className='w-full font-poppins px-3 pt-0 pb-6'>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart
                        data={chartData}
                        layout="vertical"
                        barGap={2}
                        margin={{ left: 0, right: 0, top: 0, bottom: 0 }}
                    >
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="label"
                            type="category"
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: "#000", fontSize: 10, fontWeight: 500 }}
                        />
                        <Tooltip content={<CustomChartTooltip />} cursor={false} />
                        <Legend
                            wrapperStyle={{ paddingTop: "20px", textTransform: "capitalize", fontSize: 12, color: '#000' }}
                            align='center'
                            iconType="circle"
                            iconSize={9}
                        />
                        <Bar
                            dataKey="female"
                            stackId="a"
                            fill="#c4b5a0"
                            label={{ fill: '#3d2817', fontSize: 10, fontWeight: 700, position: 'center' }}
                            maxBarSize={24}
                            radius={[2.26, 0, 0, 2.26]}
                        />
                        <Bar
                            dataKey="male"
                            stackId="a"
                            fill="#3d2817"
                            label={{ fill: '#fff', fontSize: 10, fontWeight: 700, position: 'center' }}
                            maxBarSize={24}
                            radius={[0, 2.26, 2.26, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}

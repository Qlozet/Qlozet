"use client"

import { JSX, useMemo } from "react";
import { useGetOrdersQuery } from "@/redux/services/dashboard/dashboard.api-slice";
import { ChartSkeleton } from "../molecules/chart-skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from "recharts";
import { CustomChartTooltip } from "../molecules/custom-chart-tooltip";
import ChartLegendIcon from "../atoms/chart-legend-icon";

// Brown shades matching Sales by Product Category
const COLORS = ['#3d2817', '#5b4636', '#8a7060', '#9C857870'];

const renderLegend = (props: any): JSX.Element => {
    const payload = props?.payload ?? [];

    return (
        <ul className="w-full h-fit flex flex-wrap items-center justify-center gap-x-6 gap-y-2 p-0 pt-[20px] pb-[1px] m-0 text-center text-xs capitalize">
            {
                payload?.map((entry: any, index: number) => {
                    const { color } = entry;
                    return (
                        <li key={`item-${index}`} className="flex items-center gap-x-2">
                            <span>
                                <ChartLegendIcon color={color ?? "#000"} />
                            </span>
                            <span className="text-black dark:text-white">
                                {entry.value}
                            </span>
                        </li>
                    )
                })
            }
        </ul>
    );
}

export const OrdersByProduct = () => {
    const { data: ordersResponse, isLoading } = useGetOrdersQuery();

    // Derive product kind counts from orders
    const chartData = useMemo(() => {
        const orders = ordersResponse?.data?.data ?? []
        let customClothing = 0
        let nonCustomClothing = 0
        let fabric = 0
        let accessory = 0

        orders.forEach((order: any) => {
            const items = order.items ?? order.products ?? []
            items.forEach((item: any) => {
                const kind = item.kind ?? item.product?.kind ?? ''
                const type = item.type ?? item.product?.clothing?.type ?? item.clothing?.type ?? ''

                if (kind === 'clothing') {
                    if (type === 'custom') {
                        customClothing++
                    } else {
                        nonCustomClothing++
                    }
                } else if (kind === 'fabric') {
                    fabric++
                } else if (kind === 'accessory') {
                    accessory++
                }
            })
        })

        // If no real data, show placeholder
        const total = customClothing + nonCustomClothing + fabric + accessory
        if (total === 0) {
            return [
                { name: "Custom Clothing", value: 40 },
                { name: "Non-Custom Clothing", value: 30 },
                { name: "Fabric", value: 20 },
                { name: "Accessory", value: 10 },
            ]
        }

        return [
            { name: "Custom Clothing", value: customClothing },
            { name: "Non-Custom Clothing", value: nonCustomClothing },
            { name: "Fabric", value: fabric },
            { name: "Accessory", value: accessory },
        ].filter(d => d.value > 0).sort((a, b) => b.value - a.value);
    }, [ordersResponse])

    if (isLoading) {
        return <ChartSkeleton />;
    }

    return (
        <Card className="w-full max-h-[330px] rounded-[12px] custom-card-shadow">
            <CardHeader className="px-6 pb-4">
                <CardTitle className="text-sm font-medium text-[hsla(210,9%,31%,1)]">
                    Orders by product kind
                </CardTitle>
            </CardHeader>
            <CardContent className='w-full font-poppins px-3 pt-0 pb-6'>
                <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                        <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                            {chartData?.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS?.length]} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomChartTooltip />} cursor={false} />
                        <Legend
                            align='center'
                            iconType="circle"
                            iconSize={9}
                            content={renderLegend}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}

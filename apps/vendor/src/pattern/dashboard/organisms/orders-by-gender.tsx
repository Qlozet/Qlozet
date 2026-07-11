"use client"

import { JSX } from "react";
import { useGetOrdersChartQuery } from '@/redux/services/orders/orders.api-slice';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomChartTooltip } from "../molecules/custom-chart-tooltip";
import { ChartSkeleton } from "../molecules/chart-skeleton"
import ChartLegendIcon from "../atoms/chart-legend-icon";
import { ChartEmptyState } from "../molecules/chart-empty-state";

const renderLegend = (props: any): JSX.Element => {
    const payload = props?.payload ?? [];

    return (
        <ul className="w-full h-fit flex items-center justify-center gap-8 p-0 pt-[20px] pb-[1px] m-0 text-center text-xs capitalize">
            {
                payload?.map((entry: any, index: number) => {
                    const { color } = entry;
                    return (
                        <li key={`item-${index}`} className="flex items-center gap-x-2">
                            <span>
                                <ChartLegendIcon color={color ?? "#000"} />
                            </span>
                            <span className="text-black dark:text-foreground">
                                {entry.value}
                            </span>
                        </li>
                    )
                })
            }
        </ul>
    );
}

const COLORS = ["var(--chart-primary)", "var(--chart-secondary)"]

const PLACEHOLDER_DATA = [
    { name: "Male", value: 60 },
    { name: "Female", value: 40 },
];

export const OrdersByGender = () => {
    const { data: chartResponse, isLoading } = useGetOrdersChartQuery();

    if (isLoading) {
        return <ChartSkeleton />;
    }

    const rawGenderData = chartResponse?.data?.charts?.ordersByGender?.series?.[0]?.data;
    const hasData = rawGenderData && rawGenderData.length > 0 && rawGenderData.some((d: any) => d.value > 0);

    const chartData = hasData
        ? rawGenderData.map((item: any) => ({
            name: item.label,
            value: item.value,
        }))
        : PLACEHOLDER_DATA;

    const sortedData = [...chartData].sort((a: any, b: any) => b.value - a.value);

    return (
        <Card className="w-full max-h-[330px] rounded-[12px] custom-card-shadow">
            <CardHeader className="px-6 pb-4">
                <CardTitle className="text-sm font-medium text-[hsla(210,9%,31%,1)] dark:text-foreground">
                    Orders by gender
                </CardTitle>
            </CardHeader>
            <CardContent className='w-full font-poppins px-3 pt-0 pb-6'>
                <ChartEmptyState
                    isEmpty={!hasData}
                    variant="pie"
                    description="Gender breakdown will show once orders start coming in"
                >
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie data={sortedData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                                {sortedData.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
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
                </ChartEmptyState>
            </CardContent>
        </Card>
    )
}

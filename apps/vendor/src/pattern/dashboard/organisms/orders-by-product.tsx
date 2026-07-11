"use client"

import { JSX, useMemo } from "react";
import { useGetOrdersChartQuery } from '@/redux/services/orders/orders.api-slice';
import { ChartSkeleton } from "../molecules/chart-skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from "recharts";
import { CustomChartTooltip } from "../molecules/custom-chart-tooltip";
import ChartLegendIcon from "../atoms/chart-legend-icon";
import { ChartEmptyState } from "../molecules/chart-empty-state";

const COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)'];

const PLACEHOLDER_DATA = [
    { name: "Accessory", value: 35 },
    { name: "Custom", value: 25 },
    { name: "Fabric", value: 20 },
    { name: "Non-Custom", value: 20 },
];

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

export const OrdersByProduct = () => {
    const { data: chartResponse, isLoading } = useGetOrdersChartQuery();

    const { chartData, hasData } = useMemo(() => {
        const rawKindData = chartResponse?.data?.charts?.ordersByProductKind?.series?.[0]?.data;

        if (!rawKindData || rawKindData.length === 0) {
            return { chartData: PLACEHOLDER_DATA, hasData: false };
        }

        const processed = rawKindData.map((item: any) => ({
            name: item.label,   // "Accessory", "Custom", "Fabric", "Non-Custom"
            value: item.value,
        })).filter((d: any) => d.value > 0).sort((a: any, b: any) => b.value - a.value);

        if (processed.length === 0) {
            return { chartData: PLACEHOLDER_DATA, hasData: false };
        }

        return { chartData: processed, hasData: true };
    }, [chartResponse]);

    if (isLoading) {
        return <ChartSkeleton />;
    }

    return (
        <Card className="w-full max-h-[330px] rounded-[12px] custom-card-shadow">
            <CardHeader className="px-6 pb-4">
                <CardTitle className="text-sm font-medium text-[hsla(210,9%,31%,1)] dark:text-foreground">
                    Orders by product kind
                </CardTitle>
            </CardHeader>
            <CardContent className='w-full font-poppins px-3 pt-0 pb-6'>
                <ChartEmptyState
                    isEmpty={!hasData}
                    variant="pie"
                    description="Product type distribution will appear as orders come in"
                >
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                                {chartData?.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS?.length]} stroke="none" />
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

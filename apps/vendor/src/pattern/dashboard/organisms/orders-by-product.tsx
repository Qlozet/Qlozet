"use client"

import { JSX } from "react";
import { useGetTopProductsQuery } from "@/redux/services/dashboard/dashboard.api-slice";
import { ChartSkeleton } from "../molecules/chart-skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, Label, LabelList, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CustomChartTooltip } from "../molecules/custom-chart-tooltip";
import ChartLegendIcon from "../atoms/chart-legend-icon";

const chartData = [
    { label: "AMASI QUEEN DRE...", male: 50, female: 30 },
    { label: "MAISON DE VETEMENTS ...", male: 40, female: 25 },
    { label: "MOTORSPORT RU...", male: 30, female: 20 },
    { label: "WARM CASUAL", male: 25, female: 15 },
]

const renderBlackLegendText = (value: string, entry: any) => {
    return <span style={{ display: "inline-block", color: "#000", marginRight: "32px" }}>{value}</span>
};

const renderLegend = (props: any): JSX.Element => {
    const payload = props?.payload ?? [];

    return (
        <ul className="w-full h-fit flex items-center gap-8 p-0 pl-2.5 pb-[1px] pt-[20px] m-0 text-left text-xs capitalize">
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

const renderLabel = (props: any): JSX.Element => {
    console.log("Label list label props: ", props?.content)
    return (
        <p className="text-white font-medium">
            {props?.entry?.value}
        </p>
    );
}

export const OrdersByProduct = () => {
    // Top Products API Query
    const { data: productsData, isLoading: productsLoading } = useGetTopProductsQuery();

    if (productsLoading) {
        return <ChartSkeleton />;
    }

    return (
        <Card className="w-full max-h-[330px] rounded-[12px] custom-card-shadow">
            <CardHeader className="px-6 pb-4">
                <CardTitle className="text-sm font-medium text-[hsla(210,9%,31%,1)]">
                    Orders by product
                </CardTitle>
            </CardHeader>
            <CardContent className='w-full font-poppins px-3 pt-0 pb-6'>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart
                        data={chartData}
                        responsive
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
                            padding={{ top: 0, bottom: 0}}
                        />
                        <div className="h-full w-full flex flex-col gap-y-4">
                            {chartData?.map(({ label }, index) => (
                                <Label key={index} value={label} />
                            ))}
                        </div>
                        <Tooltip content={<CustomChartTooltip />} cursor={false} />
                        <Legend
                            align='left'
                            iconType="circle"
                            iconSize={9}
                            content={renderLegend}
                        />
                        <Bar
                            dataKey="male"
                            stackId="a"
                            fill="#3d2817"
                            label={{ fill: '#fff', fontSize: 10, fontWeight: 700, position: 'center' }}
                            maxBarSize={24}
                            radius={[2.26, 0, 0, 2.26]}
                        />
                        <Bar
                            dataKey="female"
                            stackId="a"
                            fill="#9C857870"
                            label={{ fill: '#3d2817', fontSize: 10, fontWeight: 700, position: 'center' }}
                            maxBarSize={24}
                            radius={[0, 2.26, 2.26, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}

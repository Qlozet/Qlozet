"use client"

import { JSX } from "react";
import { Bar, BarChart, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetOrdersChartQuery } from '@/redux/services/orders/orders.api-slice';
import { ChartSkeleton } from '../molecules/chart-skeleton';
import { CustomChartTooltip } from '../molecules/custom-chart-tooltip';
import ChartLegendIcon from "../atoms/chart-legend-icon";
import { ChartEmptyState } from '../molecules/chart-empty-state';

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
                                <ChartLegendIcon color={color} />
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

const PLACEHOLDER_DATA = [
    { label: "LAGOS", male: 18, female: 14 },
    { label: "ABUJA", male: 12, female: 10 },
    { label: "RIVERS", male: 8, female: 6 },
    { label: "KANO", male: 5, female: 4 },
    { label: "OYO", male: 4, female: 3 },
];

export const OrdersByLocation = () => {
    const { data: chartResponse, isLoading } = useGetOrdersChartQuery();

    if (isLoading) {
        return <ChartSkeleton />;
    }

    const locationData = chartResponse?.data?.charts?.ordersByLocation;
    const maleSeries = locationData?.series?.find((s: any) => s.key === 'male');
    const femaleSeries = locationData?.series?.find((s: any) => s.key === 'female');

    const hasData = maleSeries?.data?.length > 0 && maleSeries.data.some((item: any) => item.value > 0);

    // Merge male + female series into the shape Recharts expects
    const chartData = hasData
        ? maleSeries.data.map((item: any, i: number) => ({
            label: item.label?.toUpperCase() ?? 'UNKNOWN',
            male: item.value ?? 0,
            female: femaleSeries?.data?.[i]?.value ?? 0,
        }))
        : PLACEHOLDER_DATA;

    return (
        <>
            <Card className="w-full max-h-[330px] rounded-[12px] custom-card-shadow">
                <CardHeader className="px-6 pb-4">
                    <CardTitle className="text-sm font-medium text-[hsla(210,9%,31%,1)] dark:text-foreground">
                        Orders by top location
                    </CardTitle>
                </CardHeader>
                <CardContent className='w-full font-poppins pl-3 pr-8 pt-0 pb-6'>
                    <ChartEmptyState
                        isEmpty={!hasData}
                        variant="bar"
                        description="Location insights will appear as orders arrive from different regions"
                    >
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
                                    tick={{ fill: "var(--foreground)", fontSize: 10, fontWeight: 500 }}
                                    padding={{ top: 0, bottom: 0 }}
                                />
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
                                    fill="var(--chart-primary)"
                                    maxBarSize={24}
                                    radius={[2.26, 0, 0, 2.26]}
                                />
                                <Bar
                                    dataKey="female"
                                    stackId="a"
                                    fill="var(--chart-secondary)"
                                    maxBarSize={24}
                                    radius={[0, 2.26, 2.26, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartEmptyState>
                </CardContent>
            </Card>
        </>
    );
}
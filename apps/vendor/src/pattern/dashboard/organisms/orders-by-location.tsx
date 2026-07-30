"use client"

import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetOrdersChartQuery } from '@/redux/services/orders/orders.api-slice';
import { ChartSkeleton } from '../molecules/chart-skeleton';
import { CustomChartTooltip } from '../molecules/custom-chart-tooltip';
import { ChartEmptyState } from '../molecules/chart-empty-state';

const PLACEHOLDER_DATA = [
    { label: "LAGOS", orders: 32 },
    { label: "ABUJA", orders: 22 },
    { label: "RIVERS", orders: 14 },
    { label: "KANO", orders: 9 },
    { label: "OYO", orders: 7 },
];

export const OrdersByLocation = () => {
    const { data: chartResponse, isLoading } = useGetOrdersChartQuery();

    if (isLoading) {
        return <ChartSkeleton />;
    }

    const locationData = chartResponse?.data?.charts?.ordersByLocation;
    const ordersSeries =
        locationData?.series?.find((s: any) => s.key === 'orders') ??
        locationData?.series?.[0];

    const hasData =
        (ordersSeries?.data?.length ?? 0) > 0 &&
        ordersSeries.data.some((item: any) => item.value > 0);

    // One bar per state = total orders (clean, always populated when there are orders).
    const chartData = hasData
        ? ordersSeries.data.map((item: any) => ({
            label: item.label?.toUpperCase() ?? 'UNKNOWN',
            orders: item.value ?? 0,
        }))
        : PLACEHOLDER_DATA;

    return (
        <>
            <Card className="w-full max-h-[330px] rounded-[12px] custom-card-shadow">
                <CardHeader className="px-6 pb-4">
                    <CardTitle className="text-sm font-medium text-[hsla(210,9%,31%,1)] dark:text-foreground">
                        Sales by top location
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
                                margin={{ left: 0, right: 0, top: 8, bottom: 0 }}
                            >
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="label"
                                    type="category"
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: "var(--foreground)", fontSize: 10, fontWeight: 500 }}
                                    padding={{ top: 0, bottom: 0 }}
                                    width={70}
                                />
                                <Tooltip content={<CustomChartTooltip />} cursor={false} />
                                <Bar
                                    dataKey="orders"
                                    fill="var(--chart-primary)"
                                    maxBarSize={24}
                                    radius={[2.26, 2.26, 2.26, 2.26]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartEmptyState>
                </CardContent>
            </Card>
        </>
    );
}
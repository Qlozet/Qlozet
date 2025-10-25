import { Bar, BarChart, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetTopLocationsQuery } from '@/redux/services/dashboard/dashboard.api-slice';
import { ChartSkeleton } from '../molecules/chart-skeleton';
import { CustomChartTooltip } from '../molecules/custom-chart-tooltip';

const chartData = [
    { label: "KADUNA", male: 2400, female: 800 },
    { label: "ABUJA", male: 2800, female: 1000 },
    { label: "LAGOS", male: 2000, female: 600 },
    { label: "JOS", male: 1800, female: 500 },
];

export const OrdersByLocation = () => {
    // Top Locations API Query
    const { data: topLocationsData, isLoading: topLocationsLoading } = useGetTopLocationsQuery();

    if (topLocationsLoading) {
        return <ChartSkeleton />;
    }

    return (
        <>
            <Card className="w-full max-h-[330px]">
                <CardHeader className="px-6 pb-4">
                    <CardTitle className="text-sm font-medium text-[hsla(210,9%,31%,1)]">
                        Orders by top location
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
                            <Tooltip content={<CustomChartTooltip  />} cursor={false} />
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
        </>
    );
}
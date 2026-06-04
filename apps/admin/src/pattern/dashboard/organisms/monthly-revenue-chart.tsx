"use client"

import { Bar, BarChart, Cell, ReferenceLine, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { BarChart3 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { CustomXAxisTick } from '../molecules/custom-x-axis-tick';

const chartData = [
    { month: "Jan", value: 280 },
    { month: "Feb", value: 760 },
    { month: "Mar", value: 470 },
    { month: "Apr", value: 540 },
    { month: "May", value: 450 },
    { month: "Jun", value: 890 },
    { month: "Jul", value: 360 },
    { month: "Aug", value: 720 },
    { month: "Sep", value: 180 },
    { month: "Oct", value: 560 },
    { month: "Nov", value: 320 },
    { month: "Dec", value: 470 },
];

// Highlight the peak month (Jun)
const MAX_VALUE = Math.max(...chartData.map((d) => d.value));

export const MonthlyRevenueChart = () => {
    return (
        <Card className="relative w-full h-[450px] overflow-hidden rounded-[12px] custom-card-shadow">
            {/* Chart type toggle */}
            <button className="absolute top-5 right-5 z-10 flex items-center justify-center size-9 rounded-lg bg-gray-100 hover:bg-gray-200 transition">
                <BarChart3 className="size-4 text-gray-700" />
            </button>

            <CardContent className="pt-7 px-6 h-full flex flex-col">
                <p className="text-3xl font-bold text-[hsla(210,9%,31%,1)]">N890.93</p>

                <div className="flex-1 mt-8">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            margin={{ top: 20, right: 40, left: 0, bottom: 0 }}
                        >
                            <XAxis
                                dataKey="month"
                                tick={<CustomXAxisTick />}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis hide domain={[0, MAX_VALUE * 1.1]} />
                            <ReferenceLine
                                y={MAX_VALUE}
                                stroke="#3d2817"
                                strokeDasharray="6 4"
                                strokeWidth={1.5}
                                label={{
                                    value: "MAX",
                                    position: "right",
                                    fill: "#3d2817",
                                    fontSize: 11,
                                    fontWeight: 700,
                                }}
                            />
                            <Bar dataKey="value" maxBarSize={28} radius={[4, 4, 0, 0]}>
                                {chartData?.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.value === MAX_VALUE ? "#3d2817" : "#d4c5b9"}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}

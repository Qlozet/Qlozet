"use client"

import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { BarChart3 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const chartData = [
    { x: 1, value: 30 },
    { x: 2, value: 45 },
    { x: 3, value: 35 },
    { x: 4, value: 60 },
    { x: 5, value: 48 },
    { x: 6, value: 72 },
    { x: 7, value: 55 },
    { x: 8, value: 80 },
    { x: 9, value: 62 },
    { x: 10, value: 90 },
    { x: 11, value: 70 },
    { x: 12, value: 96 },
];

export const ExpectedEarningsChart = () => {
    return (
        <Card className="relative w-full h-[450px] overflow-hidden rounded-[12px] custom-card-shadow">
            {/* Chart type toggle */}
            <button className="absolute top-5 right-5 z-10 flex items-center justify-center size-9 rounded-lg bg-gray-100 hover:bg-gray-200 transition">
                <BarChart3 className="size-4 text-gray-700" />
            </button>

            <CardContent className="flex flex-col items-center justify-start pt-10 px-6">
                <p className="text-sm text-[hsla(210,9%,31%,1)]">Expected earnings</p>
                <p className="mt-2 text-3xl font-bold text-[hsla(210,9%,31%,1)]">€682.10</p>
                <span className="mt-3 inline-flex items-center rounded-full bg-[#3d2817] px-3 py-1 text-xs font-medium text-white">
                    +2.45%
                </span>
            </CardContent>

            {/* Area chart anchored to the bottom of the card */}
            <div className="absolute bottom-0 left-0 w-full h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="expectedEarningsFill" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#3d2817" stopOpacity={0.6} />
                                <stop offset="100%" stopColor="#3d2817" stopOpacity={0.02} />
                            </linearGradient>
                        </defs>
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#3d2817"
                            strokeWidth={2}
                            fill="url(#expectedEarningsFill)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
}

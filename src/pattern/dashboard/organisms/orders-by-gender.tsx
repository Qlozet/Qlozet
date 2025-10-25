"use client"

import { useGetTotalCustomersQuery } from "@/redux/services/customers/customers.api-slice"
import { useGetGenderByOrderQuery } from "@/redux/services/dashboard/dashboard.api-slice"
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomChartTooltip } from "../molecules/custom-chart-tooltip";
import { ChartSkeleton } from "../molecules/chart-skeleton"

const data = [
    { name: "Male", value: 65 },
    { name: "Female", value: 35 },
]

const COLORS = ["#3d2817", "#d4c5b9"]

export const OrdersByGender = () => {
    // Gender by Order API Query
    const { data: genderData, isLoading: genderLoading } = useGetGenderByOrderQuery();

    // Total Customers API Query
    const { data: customersData, isLoading: customersLoading } =
        useGetTotalCustomersQuery();

    if (customersLoading || genderLoading) {
        return <ChartSkeleton />;
    }

    return (
        <Card className="w-full max-h-[330px]">
            <CardHeader className="px-6 pb-4">
                <CardTitle className="text-sm font-medium text-[hsla(210,9%,31%,1)]">
                    Orders by gender
                </CardTitle>
            </CardHeader>
            <CardContent className='w-full font-poppins px-3 pt-0 pb-6'>
                <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                        <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomChartTooltip />} cursor={false} />
                        <Legend
                            wrapperStyle={{ paddingTop: "20px", textTransform: "capitalize", fontSize: 12, color: '#000' }}
                            align='center'
                            iconType="circle"
                            iconSize={9}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}

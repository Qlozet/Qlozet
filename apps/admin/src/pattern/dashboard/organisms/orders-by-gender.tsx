"use client"

import { DonutChart, type DonutDatum } from "../molecules/donut-chart"

const data: DonutDatum[] = [
    { name: "Male", value: 65 },
    { name: "Female", value: 35 },
]

const COLORS = ["#3d2817", "#d4c5b9"]

export const OrdersByGender = () => {
    return <DonutChart title="Orders by gender" data={data} colors={COLORS} />
}

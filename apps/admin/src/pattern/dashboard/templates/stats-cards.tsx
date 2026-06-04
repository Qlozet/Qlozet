"use client"

import { ArrowUp, ArrowDown, Eye } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { APP_ROUTES } from "@/lib/routes"
import { If } from "@/pattern/common/atoms/If"
import { StatCartIcon } from "../atoms/stat-cart-icon"
import { StatTruckIcon } from "../atoms/stat-truck-icon"
import { StatsCardsSkeleton } from "../molecules/stats-card-skeleton"
import { useGetAdminDashboardQuery } from "@/redux/services/dashboard/dashboard.api-slice"

// Format a numeric metric, falling back to a placeholder when absent
const formatValue = (
  value: number | undefined,
  fallback: string,
  { currency = false, percent = false }: { currency?: boolean; percent?: boolean } = {}
): string => {
  if (typeof value !== "number") return fallback
  if (percent) return `${value}%`
  const formatted = value.toLocaleString()
  return currency ? `N ${formatted}` : formatted
}

export const StatsCards = () => {
  // Admin dashboard metrics
  const { data, isLoading } = useGetAdminDashboardQuery()
  const metrics = data?.data

  if (isLoading) {
    return <StatsCardsSkeleton />
  }

  const stats = [
    {
      id: 1,
      title: "Total Vendors",
      value: formatValue(metrics?.totalVendors, "1000"),
      change: "2.5%",
      icon: <StatCartIcon fill="#57CAEB" />,
      viewAllLink: APP_ROUTES.vendors,
    },
    {
      id: 2,
      title: "Verified Vendors",
      value: formatValue(metrics?.verifiedVendors, "1000"),
      change: "2.5%",
      icon: <StatCartIcon fill="#57CAEB" />,
      viewAllLink: APP_ROUTES.vendors,
    },
    {
      id: 3,
      title: "Total Customers",
      value: formatValue(metrics?.totalCustomers, "N 50,000", { currency: true }),
      change: "2.5%",
      icon: <StatTruckIcon fill="#5DDAB4" />,
    },
    {
      id: 4,
      title: "Total Orders",
      value: formatValue(metrics?.totalOrders, "1000"),
      change: "2.5%",
      icon: <StatCartIcon fill="#57CAEB" />,
      viewAllLink: APP_ROUTES.orders,
    },
    {
      id: 5,
      title: "Gross Sales",
      value: formatValue(metrics?.grossSales, "N 50,000", { currency: true }),
      change: "2.5%",
      icon: <StatTruckIcon fill="#5DDAB4" />,
    },
    {
      id: 6,
      title: "Measurement Accuracy",
      value: formatValue(metrics?.measurementAccuracy, "95%", { percent: true }),
      change: "2.5%",
      icon: <StatCartIcon fill="#FF7976" />,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats?.map((stat) => {
        const isPositive = !stat?.change.startsWith("-")
        return (
          <Card key={stat?.id} className="h-[120px] p-3 2xl:p-5 rounded-[12px] custom-card-shadow">
            <CardContent className="h-full p-0">
              <div className="flex items-start justify-start gap-x-4">
                {/* Icon */}
                <div>{stat?.icon}</div>

                <div className="flex-1 space-y-2">
                  <div className="space-y-2">
                    <p className="text-[hsla(210,9%,31%,1)] dark:text-white text-xs font-normal">{stat?.title}</p>
                    <p className="text-2xl font-bold text-[hsla(210,9%,31%,1)] dark:text-white">{stat?.value}</p>
                  </div>

                  <div className="w-full flex items-center justify-between">
                    <p
                      className={cn(
                        "flex items-center gap-x-1 text-sm",
                        isPositive ? "text-green-600 dark:text-green-400" : "text-destructive dark:text-red-400"
                      )}
                    >
                      <span>{stat?.change}</span>
                      {isPositive ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
                    </p>

                    <If isTrue={Boolean(stat?.viewAllLink)}>
                      <Link
                        href={stat?.viewAllLink ?? "#"}
                        className="flex items-center gap-x-1 text-success dark:text-gray-400 text-xs whitespace-nowrap"
                      >
                        <Eye className="size-3.5" />
                        <span>View All</span>
                      </Link>
                    </If>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

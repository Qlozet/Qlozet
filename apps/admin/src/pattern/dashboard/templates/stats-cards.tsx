"use client"

import { APP_ROUTES } from "@/lib/routes"
import { StatCartIcon } from "../atoms/stat-cart-icon"
import { StatTruckIcon } from "../atoms/stat-truck-icon"
import { StatsCardsSkeleton } from "../molecules/stats-card-skeleton"
import { MetricCard } from "@/pattern/common/molecules/metric-card"
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
      {stats.map((stat) => (
        <MetricCard
          key={stat.id}
          title={stat.title}
          value={stat.value}
          change={stat.change}
          icon={stat.icon}
          viewAllLink={stat.viewAllLink}
        />
      ))}
    </div>
  )
}

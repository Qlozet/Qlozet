"use client"

import { ShoppingCart, TrendingUp, Package, RotateCcw } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export const StatsCards = () => {
  const stats = [
    {
      title: "Total Orders",
      value: "1000",
      change: "+24%",
      icon: ShoppingCart,
      bgColor: "bg-blue-100 dark:bg-blue-900",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Total earnings",
      value: "₦50,000",
      change: "+2.5%",
      icon: TrendingUp,
      bgColor: "bg-green-100 dark:bg-green-900",
      iconColor: "text-green-600 dark:text-green-400",
    },
    {
      title: "Average orders per day",
      value: "900",
      change: "+2.5%",
      icon: Package,
      bgColor: "bg-red-100 dark:bg-red-900",
      iconColor: "text-red-600 dark:text-red-400",
    },
    {
      title: "Total returns",
      value: "10",
      change: "-2.6%",
      icon: RotateCcw,
      bgColor: "bg-orange-100 dark:bg-orange-900",
      iconColor: "text-orange-600 dark:text-orange-400",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{stat.value}</p>
                <p
                  className={`text-sm mt-2 ${stat.change.startsWith("+") ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                >
                  {stat.change} <span className="text-gray-500 dark:text-gray-400">View All</span>
                </p>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

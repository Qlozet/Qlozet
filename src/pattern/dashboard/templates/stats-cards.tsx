"use client"

import { ShoppingCart, TrendingUp, Package, RotateCcw, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { APP_ROUTES } from "@/lib/routes"
import { If } from "@/pattern/common/atoms/If"
import { TotalReturnsCardIcon } from "../atoms/total-returns-card-icon"
import { TotalEarningsCardIcon } from "../atoms/total-earnings-card-icon"
import { TotalOrdersCardIcon } from "../atoms/total-orders-card-icon"
import { AverageOrdersPerDayCardIcon } from "../atoms/average-orders-per-day-card-icon"

export const StatsCards = () => {
  const stats = [
    {
      id: 1,
      title: "Total Orders",
      value: "1000",
      change: "+24%",
      icon: <TotalOrdersCardIcon />,
      bgColor: "bg-blue-100 dark:bg-blue-900",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      id: 2,
      title: "Total earnings",
      value: "N50,000",
      change: "+2.5%",
      icon: <TotalEarningsCardIcon />,
      bgColor: "bg-green-100 dark:bg-green-900",
      iconColor: "text-green-600 dark:text-green-400",
    },
    {
      id: 3,
      title: "Average orders per day",
      value: "900",
      change: "+2.5%",
      icon: <AverageOrdersPerDayCardIcon />,
      bgColor: "bg-red-100 dark:bg-red-900",
      iconColor: "text-red-600 dark:text-red-400",
    },
    {
      id: 4,
      title: "Total returns",
      value: "10",
      change: "-2.6%",
      icon: <TotalReturnsCardIcon />,
      bgColor: "bg-orange-100 dark:bg-orange-900",
      iconColor: "text-orange-600 dark:text-orange-400",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => (
        <Card key={stat.title} className="h-[120px] p-3 2xl:p-5 rounded-[12px] custom-card-shadow">
          <CardContent className="h-full p-0">
            <div className="flex items-start justify-start gap-x-4">
              {/* Icon */}
              <div>
                {stat.icon}
              </div>

              <div className="flex-1 space-y-2">
                <div className="space-y-2">
                  <p className="text-[hsla(210,9%,31%,1)] dark:text-white text-xs font-normal">{stat.title}</p>
                  <p className="text-2xl font-bold text-[hsla(210,9%,31%,1)] dark:text-white">{stat.value}</p>
                </div>

                <div className="w-full flex items-center justify-between">
                  <p
                    className={cn("text-sm", stat.change.startsWith("+") ? "text-green-600 dark:text-green-400" : "text-destructive dark:text-red-400")}
                  >
                    {stat.change}
                  </p>

                  <If isTrue={stat.id === 1} >
                    <Link href={APP_ROUTES.orders} className="flex items-center text-success dark:text-gray-400 text-xs whitespace-nowrap">
                      <span>
                        View All
                      </span>
                      <span>
                        <ChevronRight className="size-3 ml-1" />
                      </span>
                    </Link>
                  </If>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

'use client';

import { ChevronRight, ArrowUp, ArrowDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { APP_ROUTES } from '@/lib/routes';
import { If } from '@/pattern/common/atoms/If';
import { TotalReturnsCardIcon } from '../atoms/total-returns-card-icon';
import { TotalEarningsCardIcon } from '../atoms/total-earnings-card-icon';
import { TotalOrdersCardIcon } from '../atoms/total-orders-card-icon';
import { AverageOrdersPerDayCardIcon } from '../atoms/average-orders-per-day-card-icon';
import { useGetOrdersChartQuery } from '@/redux/services/orders/orders.api-slice';
import { StatsCardSkeleton } from '../molecules/stats-card-skeleton';
import { readMetricChange, type MetricChange } from '../lib/metric-change';

// A "returns went up" delta is bad news, so the two returns-style metrics read
// their colour inverted — an up arrow stays, but in red.
const changeToneClass = (change: MetricChange, higherIsBetter: boolean) => {
  if (change.direction === 'flat') return 'text-grey3 dark:text-gray-400';
  const good = change.direction === 'up' ? higherIsBetter : !higherIsBetter;
  return good
    ? 'text-green-600 dark:text-green-400'
    : 'text-destructive dark:text-red-400';
};

export const StatsCards = () => {
  const { data: chartResponse, isLoading } = useGetOrdersChartQuery();
  const summary = chartResponse?.data?.summary;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const stats = [
    {
      id: 1,
      title: 'Total Orders',
      value: summary?.totalOrders?.toLocaleString() ?? '—',
      change: readMetricChange(summary, 'totalOrders'),
      higherIsBetter: true,
      icon: <TotalOrdersCardIcon />,
    },
    {
      id: 2,
      title: 'Total earnings',
      value: summary ? `₦${summary.totalEarnings?.toLocaleString()}` : '—',
      change: readMetricChange(summary, 'totalEarnings'),
      higherIsBetter: true,
      icon: <TotalEarningsCardIcon />,
    },
    {
      id: 3,
      title: 'Average orders per day',
      value: summary?.averageOrdersPerDay?.toLocaleString() ?? '—',
      change:
        readMetricChange(summary, 'averageOrders') ??
        readMetricChange(summary, 'averageOrdersPerDay'),
      higherIsBetter: true,
      icon: <AverageOrdersPerDayCardIcon />,
    },
    {
      id: 4,
      title: 'Total returns',
      value: summary?.totalReturns?.toLocaleString() ?? '—',
      change: readMetricChange(summary, 'totalReturns'),
      higherIsBetter: false,
      icon: <TotalReturnsCardIcon />,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats?.map((stat) => (
        <Card
          key={stat.title}
          className="h-[120px] p-3 2xl:p-5 rounded-[12px] custom-card-shadow"
        >
          <CardContent className="h-full p-0">
            <div className="flex items-start justify-start gap-x-4">
              {/* Icon */}
              <div>{stat.icon}</div>

              <div className="flex-1 space-y-2">
                <div className="space-y-2">
                  <p className="text-[hsla(210,9%,31%,1)] dark:text-white text-xs font-normal">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-[hsla(210,9%,31%,1)] dark:text-white">
                    {stat.value}
                  </p>
                </div>

                <div className="w-full flex items-center justify-between">
                  {/* Rendered only when the API actually sent a delta — an
                      absent one used to fall through as a red em-dash. */}
                  <If isTrue={Boolean(stat.change)}>
                    <p
                      data-testid={`stat-change-${stat.id}`}
                      className={cn(
                        'flex items-center gap-x-1 text-sm',
                        stat.change &&
                          changeToneClass(stat.change, stat.higherIsBetter)
                      )}
                    >
                      <span>{stat.change?.label}</span>
                      <If isTrue={stat.change?.direction === 'up'}>
                        <ArrowUp className="size-3" aria-hidden />
                      </If>
                      <If isTrue={stat.change?.direction === 'down'}>
                        <ArrowDown className="size-3" aria-hidden />
                      </If>
                    </p>
                  </If>

                  <If isTrue={stat.id === 1}>
                    <Link
                      href={APP_ROUTES.orders}
                      className="ml-auto flex items-center text-success dark:text-gray-400 text-xs whitespace-nowrap"
                    >
                      <span>View All</span>
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
  );
};

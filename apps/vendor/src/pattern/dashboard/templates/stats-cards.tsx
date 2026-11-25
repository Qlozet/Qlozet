'use client';

import { ChevronRight, ArrowUp, ArrowDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { APP_ROUTES } from '@/lib/routes';
import { If } from '@/pattern/common/atoms/If';
import { useGetOrdersChartQuery } from '@/redux/services/orders/orders.api-slice';
import { StatsCardSkeleton } from '../molecules/stats-card-skeleton';
import { readMetricChange, type MetricChange } from '../lib/metric-change';
import { useDashboardRange } from '../lib/use-dashboard-range';

// A "returns went up" delta is bad news, so the two returns-style metrics read
// their colour inverted — an up arrow stays, but in red.
const changeToneClass = (change: MetricChange, higherIsBetter: boolean) => {
  if (change.direction === 'flat') return 'text-muted-foreground';
  const good = change.direction === 'up' ? higherIsBetter : !higherIsBetter;
  return good
    ? 'text-green-600 dark:text-green-400'
    : 'text-destructive dark:text-red-400';
};

export const StatsCards = () => {
  const [range] = useDashboardRange();
  const { data: chartResponse, isLoading } = useGetOrdersChartQuery({ range });
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
      title: 'Orders',
      value: summary?.totalOrders?.toLocaleString() ?? '—',
      change: readMetricChange(summary, 'totalOrders'),
      higherIsBetter: true,
    },
    {
      id: 2,
      title: 'Earnings',
      value: summary ? `₦${summary.totalEarnings?.toLocaleString()}` : '—',
      change: readMetricChange(summary, 'totalEarnings'),
      higherIsBetter: true,
    },
    {
      id: 3,
      title: 'Average orders per day',
      value: summary?.averageOrdersPerDay?.toLocaleString() ?? '—',
      change:
        readMetricChange(summary, 'averageOrders') ??
        readMetricChange(summary, 'averageOrdersPerDay'),
      higherIsBetter: true,
    },
    {
      id: 4,
      title: 'Returns',
      value: summary?.totalReturns?.toLocaleString() ?? '—',
      change: readMetricChange(summary, 'totalReturns'),
      higherIsBetter: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats?.map((stat) => (
        <Card
          key={stat.title}
          className="rounded-[12px] p-5 custom-card-shadow"
        >
          <CardContent className="p-0 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm text-muted-foreground">{stat.title}</p>
              <If isTrue={stat.id === 1}>
                <Link
                  href={APP_ROUTES.orders}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
                >
                  View orders
                  <ChevronRight className="size-3" aria-hidden />
                </Link>
              </If>
            </div>
            <p
              className={cn(
                'text-2xl font-medium tabular-nums',
                // Earnings is the figure a store owner opens this page for.
                stat.id === 2
                  ? 'text-primary dark:text-foreground'
                  : 'text-foreground'
              )}
            >
              {stat.value}
            </p>
            {/* Rendered only when the API actually sent a delta; an absent
                one used to fall through as a red em-dash. */}
            <If isTrue={Boolean(stat.change)}>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <span
                  data-testid={`stat-change-${stat.id}`}
                  className={cn(
                    'flex items-center gap-0.5 tabular-nums',
                    stat.change &&
                      changeToneClass(stat.change, stat.higherIsBetter)
                  )}
                >
                  <If isTrue={stat.change?.direction === 'up'}>
                    <ArrowUp className="size-3" aria-hidden />
                  </If>
                  <If isTrue={stat.change?.direction === 'down'}>
                    <ArrowDown className="size-3" aria-hidden />
                  </If>
                  {stat.change?.label}
                </span>
                vs previous period
              </p>
            </If>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

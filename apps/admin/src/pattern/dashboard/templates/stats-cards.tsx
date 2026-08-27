'use client';

import { APP_ROUTES } from '@/lib/routes';
import { StatCartIcon } from '../atoms/stat-cart-icon';
import { StatTruckIcon } from '../atoms/stat-truck-icon';
import { StatsCardsSkeleton } from '../molecules/stats-card-skeleton';
import { MetricCard } from '@/pattern/common/molecules/metric-card';
import {
  useGetAdminDashboardQuery,
  type AdminDashboardMetrics,
} from '@/redux/services/dashboard/dashboard.api-slice';

/**
 * First numeric value among `keys`, or undefined when none is present.
 *
 * Every metric on this row is typed on AdminDashboardMetrics except
 * measurement_accuracy, which the backend does not define yet. That one names
 * both the snake_case and camelCase spelling and lights up on whichever ships.
 */
const readMetric = (
  metrics: AdminDashboardMetrics | undefined,
  ...keys: string[]
): number | undefined => {
  for (const key of keys) {
    const value = metrics?.[key];
    if (typeof value === 'number' && !Number.isNaN(value)) return value;
  }
  return undefined;
};

// Format a numeric metric, falling back to a placeholder when absent
const formatValue = (
  value: number | undefined,
  fallback: string,
  {
    currency = false,
    percent = false,
  }: { currency?: boolean; percent?: boolean } = {}
): string => {
  if (typeof value !== 'number') return fallback;
  if (percent) return `${value}%`;
  const formatted = value.toLocaleString();
  return currency ? `N ${formatted}` : formatted;
};

export const StatsCards = () => {
  // Admin dashboard metrics. The card set matches the Figma overview. Five of
  // the six come straight off GET /admin/dashboard; Measurement Accuracy has no
  // backend definition yet and dashes. Nothing here invents a number — see the
  // deliberate absence of the design's "2.5%" change badges, which no endpoint
  // supports.
  const { data, isLoading } = useGetAdminDashboardQuery();
  const metrics = data?.data;

  if (isLoading) {
    return <StatsCardsSkeleton />;
  }

  const stats = [
    {
      id: 1,
      title: 'Total Vendors',
      value: formatValue(metrics?.total_vendors, '—'),
      icon: <StatCartIcon fill="#57CAEB" />,
      viewAllLink: APP_ROUTES.vendors,
    },
    {
      id: 2,
      title: 'Verified Vendors',
      value: formatValue(metrics?.verified_vendors, '—'),
      icon: <StatCartIcon fill="#57CAEB" />,
      viewAllLink: APP_ROUTES.vendors,
    },
    {
      id: 3,
      // A head count, not money — the design's "N 50,000" here is a copy-paste
      // of the Gross Sales card, so this renders as a plain count.
      title: 'Total Customers',
      value: formatValue(metrics?.total_customers, '—'),
      icon: <StatTruckIcon fill="#5DDAB4" />,
    },
    {
      id: 4,
      title: 'Total Orders',
      value: formatValue(metrics?.total_orders, '—'),
      icon: <StatCartIcon fill="#57CAEB" />,
      viewAllLink: APP_ROUTES.orders,
    },
    {
      id: 5,
      title: 'Gross Sales',
      value: formatValue(metrics?.gross_sales, '—', {
        currency: true,
      }),
      icon: <StatTruckIcon fill="#5DDAB4" />,
    },
    {
      id: 6,
      title: 'Measurement Accuracy',
      value: formatValue(
        readMetric(metrics, 'measurement_accuracy', 'measurementAccuracy'),
        '—',
        { percent: true }
      ),
      icon: <StatCartIcon fill="#FF7976" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <MetricCard
          key={stat.id}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          viewAllLink={stat.viewAllLink}
        />
      ))}
    </div>
  );
};

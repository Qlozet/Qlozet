'use client';

import { RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatNaira } from '@/lib/orders';
import type { AdminProfileOverview } from '@/redux/services/dashboard/dashboard.api-slice';

interface AdminMetricsSectionProps {
  overview?: AdminProfileOverview;
  isLoading: boolean;
  isFetching: boolean;
  onRefresh: () => void;
}

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between px-5 py-3.5">
    <span className="text-[14px] text-[#3A3A3C] dark:text-gray-200">
      {label}
    </span>
    <span className="text-[15px] font-semibold text-[#1C1C1E] dark:text-white">
      {value}
    </span>
  </div>
);

/**
 * The design's "Metrics" panel — this admin's own workload, as opposed to the
 * marketplace totals in the stat grid above it.
 *
 * Every figure is per-admin except the sales one, which is deliberately
 * platform-wide: "oversight" is what this admin is responsible for watching,
 * not what they personally sold.
 */
export const AdminMetricsSection = ({
  overview,
  isLoading,
  isFetching,
  onRefresh,
}: AdminMetricsSectionProps) => (
  <div className="overflow-hidden rounded-[20px] bg-[hsla(0,0%,96%,1)] dark:bg-muted">
    <div className="flex items-center justify-between border-b border-[#DDE2E5] dark:border-white/10 px-5 py-4">
      <span className="text-[15px] font-semibold text-[#1C1C1E] dark:text-white">
        Metrics
      </span>
      <button
        type="button"
        onClick={onRefresh}
        disabled={isFetching}
        aria-label="Refresh metrics"
        className="text-[#1C1C1E] dark:text-white transition-opacity hover:opacity-60 disabled:opacity-40"
      >
        <RefreshCw className={`size-4 ${isFetching ? 'animate-spin' : ''}`} />
      </button>
    </div>

    {isLoading ? (
      <div className="space-y-3 px-5 py-4">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
      </div>
    ) : (
      <div className="divide-y divide-[#DDE2E5] dark:divide-white/10">
        <Row
          label="Vendors Managed"
          value={(overview?.metrics.vendorsManaged ?? 0).toLocaleString()}
        />
        <Row
          label="Tickets resolved"
          value={(overview?.metrics.ticketsResolved ?? 0).toLocaleString()}
        />
        <Row
          label="Total sales oversight"
          value={formatNaira(overview?.metrics.totalSalesOversight ?? 0)}
        />
      </div>
    )}
  </div>
);

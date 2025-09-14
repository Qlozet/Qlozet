// Dashboard Content - Organism
// Main dashboard layout combining all sections

import React from 'react';
import { cn } from '@/lib/utils';
import { MetricsSection } from '../molecules/metrics-section';
import { ChartGrid } from '../molecules/chart-grid';
import { AnalyticsGrid } from '../molecules/analytics-grid';
import { RecentOrdersSection } from '../molecules/recent-orders-section';
import { LoadingSkeleton } from '../atoms/loading-skeleton';

interface DashboardData {
  metrics: Array<{
    title: string;
    value: string | number;
    icon: any;
    bgColor: string;
    link?: string;
  }>;
  charts: Array<{
    title: string;
    chart: React.ReactNode;
    isLoading?: boolean;
  }>;
  analytics: Array<{
    name: string;
    data: any[];
    component: React.ComponentType<{ name: string; data: any[] }>;
  }>;
  recentOrders: any[];
  recentOrdersComponent: React.ReactNode;
}

interface DashboardContentProps {
  data: DashboardData;
  isLoading?: boolean;
  className?: string;
}

export const DashboardContent: React.FC<DashboardContentProps> = ({
  data,
  isLoading = false,
  className
}) => {
  if (isLoading) {
    return (
      <div className={cn("w-full", className)}>
        <LoadingSkeleton variant="card" count={4} />
        <div className="mt-8">
          <LoadingSkeleton variant="chart" count={3} />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Metrics Cards */}
      <MetricsSection metrics={data.metrics} />
      
      {/* Main Content Area */}
      <div className="bg-[#F8F9FA] px-4 lg:px-0">
        {/* Charts Section */}
        <ChartGrid charts={data.charts} />
        
        {/* Analytics and Recent Orders */}
        <div className="block md:flex lg:flex w-full md:gap-[21px] gap-4 mt-4">
          <AnalyticsGrid analytics={data.analytics} />
          <RecentOrdersSection orders={data.recentOrders}>
            {data.recentOrdersComponent}
          </RecentOrdersSection>
        </div>
      </div>
    </div>
  );
};
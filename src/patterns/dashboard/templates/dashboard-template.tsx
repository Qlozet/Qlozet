// Dashboard Template - Template
// Complete dashboard page template

import React from 'react';
import { cn } from '@/lib/utils';
import { DashboardContent } from '../organisms/dashboard-content';

interface DashboardTemplateProps {
  data: {
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
  };
  isLoading?: boolean;
  className?: string;
}

export const DashboardTemplate: React.FC<DashboardTemplateProps> = ({
  data,
  isLoading = false,
  className,
}) => {
  return (
    <section className={cn('', className)}>
      <div className='flex bg-gray-400 w-full h-full'>
        <div className='w-full mb-[2rem]'>
          <DashboardContent data={data} isLoading={isLoading} />
        </div>
      </div>
    </section>
  );
};

export default DashboardTemplate;

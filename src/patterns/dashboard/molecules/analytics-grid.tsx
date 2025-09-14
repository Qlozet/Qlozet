// Analytics Grid - Molecule
// Grid layout for analytics charts (earnings and order count)

import React from 'react';
import { cn } from '@/lib/utils';

interface AnalyticsData {
  name: string;
  data: any[];
  component: React.ComponentType<{ name: string; data: any[] }>;
}

interface AnalyticsGridProps {
  analytics: AnalyticsData[];
  className?: string;
}

export const AnalyticsGrid: React.FC<AnalyticsGridProps> = ({
  analytics,
  className
}) => {
  return (
    <div className={cn("block md:flex lg:flex w-full md:gap-[21px] gap-4 mt-4", className)}>
      <div className="w-full md:w-2/3 block md:flex md:gap-[21px] gap-4 mt-3">
        {analytics.slice(0, 2).map((analytic, index) => {
          const AnalyticComponent = analytic.component;
          return (
            <div 
              key={index} 
              className={cn(
                "w-full bg-white rounded-[12px] p-6 block shadow-[0px_4px_10px_#AEAEC026]",
                index === 1 && "mt-4 md:mt-0"
              )}
            >
              <AnalyticComponent name={analytic.name} data={analytic.data} />
            </div>
          );
        })}
      </div>
    </div>
  );
};
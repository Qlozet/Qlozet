// Metrics Section - Molecule
// Horizontal scrollable section displaying dashboard metric cards

import React from 'react';
import { cn } from '@/lib/utils';
import { MetricCard } from '../atoms/metric-card';

interface MetricCardData {
  title: string;
  value: string | number;
  icon: any;
  bgColor: string;
  link?: string;
  onClick?: () => void;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

interface MetricsSectionProps {
  metrics: MetricCardData[];
  className?: string;
}

export const MetricsSection: React.FC<MetricsSectionProps> = ({
  metrics,
  className
}) => {
  return (
    <div 
      className={cn(
        "scrollbar-hide flex items-center gap-4 overflow-x-scroll px-4 bg-transparent py-2",
        className
      )}
    >
      {metrics.map((metric, index) => (
        <MetricCard
          key={index}
          title={metric.title}
          value={metric.value}
          icon={metric.icon}
          bgColor={metric.bgColor}
          trend={metric.trend}
          link={metric.link}
          onClick={metric.onClick}
        />
      ))}
    </div>
  );
};
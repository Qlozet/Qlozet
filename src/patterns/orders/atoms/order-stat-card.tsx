// Order Stat Card - Atom
// Simple card for displaying order statistics

import React from 'react';
import { cn } from '@/lib/utils';

interface OrderStatCardProps {
  title: string;
  value: string | number;
  bgColor?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export const OrderStatCard: React.FC<OrderStatCardProps> = ({ 
  title, 
  value, 
  bgColor = 'bg-blue-500',
  icon,
  trend,
  className 
}) => {
  return (
    <div 
      className={cn(
        'relative p-6 rounded-lg text-white shadow-sm',
        bgColor,
        className
      )}
    >
      {icon && (
        <div className="absolute top-4 right-4 opacity-80">
          {icon}
        </div>
      )}
      
      <div className="space-y-2">
        <p className="text-sm font-medium opacity-90">
          {title}
        </p>
        <p className="text-2xl font-bold">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        
        {trend && (
          <div className="flex items-center space-x-1 text-xs opacity-90">
            <span className={trend.isPositive ? 'text-green-200' : 'text-red-200'}>
              {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
            </span>
            <span>vs last period</span>
          </div>
        )}
      </div>
    </div>
  );
};
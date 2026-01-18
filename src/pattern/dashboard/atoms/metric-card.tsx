// Metric Card - Atom
// Displays a single metric with icon and trend

import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  bgColor?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  link?: string;
  onClick?: () => void;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  bgColor = 'bg-blue-500',
  trend,
  link,
  onClick,
  className,
}) => {
  const CardComponent = onClick || link ? 'button' : 'div';

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (link) {
      window.location.href = link;
    }
  };

  return (
    <CardComponent
      onClick={handleClick}
      className={cn(
        'relative p-6 rounded-lg text-white shadow-sm min-w-[280px] text-left',
        bgColor,
        (onClick || link) &&
          'cursor-pointer hover:opacity-90 transition-opacity',
        className
      )}
    >
      {icon && <div className='absolute top-4 right-4 opacity-80'>{icon}</div>}

      <div className='space-y-2'>
        <p className='text-sm font-medium opacity-90'>{title}</p>
        <p className='text-2xl font-bold'>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>

        {trend && (
          <div className='flex items-center space-x-1 text-xs opacity-90'>
            {trend.isPositive ? (
              <TrendingUp className='h-3 w-3' />
            ) : (
              <TrendingDown className='h-3 w-3' />
            )}
            <span
              className={trend.isPositive ? 'text-green-200' : 'text-red-200'}
            >
              {Math.abs(trend.value)}%
            </span>
            <span>vs last period</span>
          </div>
        )}
      </div>
    </CardComponent>
  );
};

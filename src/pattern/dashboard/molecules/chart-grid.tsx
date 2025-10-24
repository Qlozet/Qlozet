// Chart Grid - Molecule
// Responsive grid layout for chart cards

import React from 'react';
import { cn } from '@/lib/utils';
import { ChartContainer } from '../atoms/chart-container';

interface ChartData {
  title: string;
  chart: React.ReactNode;
  headerAction?: React.ReactNode;
  isLoading?: boolean;
}

interface ChartGridProps {
  charts: ChartData[];
  className?: string;
}

export const ChartGrid: React.FC<ChartGridProps> = ({ charts, className }) => {
  return (
    <div
      className={cn(
        'md:flex block lg:flex items-center w-full md:gap-[21px] gap-4',
        className
      )}
    >
      <div className='w-full md:w-2/3 block lg:flex items-center md:gap-[21px] gap-4 mt-4 md:flex'>
        {charts.slice(0, 2).map((chart, index) => (
          <div
            key={index}
            className={cn('w-full', index === 1 && 'mt-4 lg:mt-0')}
          >
            <ChartContainer
              title={chart.title}
              headerAction={chart.headerAction}
              isLoading={chart.isLoading}
            >
              {chart.chart}
            </ChartContainer>
          </div>
        ))}
      </div>

      {charts[2] && (
        <div className='w-full md:w-1/3 block lg:flex items-center mt-4'>
          <div className='w-full flex items-center'>
            <ChartContainer
              title={charts[2].title}
              headerAction={charts[2].headerAction}
              isLoading={charts[2].isLoading}
            >
              {charts[2].chart}
            </ChartContainer>
          </div>
        </div>
      )}
    </div>
  );
};

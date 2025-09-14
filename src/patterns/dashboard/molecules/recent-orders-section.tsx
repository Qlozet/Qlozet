// Recent Orders Section - Molecule
// Container for displaying recent orders list

import React from 'react';
import { cn } from '@/lib/utils';

interface Order {
  status: string;
  [key: string]: any;
}

interface RecentOrdersSectionProps {
  orders: Order[];
  className?: string;
  children: React.ReactNode;
}

export const RecentOrdersSection: React.FC<RecentOrdersSectionProps> = ({
  orders,
  className,
  children
}) => {
  return (
    <div className={cn("w-full md:w-1/3 flex mt-4", className)}>
      <div className="bg-white rounded-[12px] w-full flex gap-4 h-full shadow-[0px_4px_10px_#AEAEC026]">
        <div className="p-3 text-dark w-full">
          {children}
        </div>
      </div>
    </div>
  );
};
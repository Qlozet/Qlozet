// Customer Stats Section - Molecule
// Dashboard cards showing customer statistics

import React from 'react';
import { CustomerStatCard } from '../atoms/customer-stat-card';
import { Users, MapPin, TrendingUp, UserCheck } from 'lucide-react';

interface CustomerStatsData {
  totalCustomers: number;
  activeCustomers: number;
  topLocation: string;
  growth?: number;
}

interface CustomerStatsSectionProps {
  stats: CustomerStatsData;
  isLoading?: boolean;
}

export const CustomerStatsSection: React.FC<CustomerStatsSectionProps> = ({ 
  stats, 
  isLoading = false 
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="h-32 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <CustomerStatCard
        title="Total Customers"
        value={stats.totalCustomers}
        bgColor="bg-blue-500"
        icon={<Users className="h-6 w-6" />}
      />
      
      <CustomerStatCard
        title="Active Customers"
        value={stats.activeCustomers}
        bgColor="bg-green-500"
        icon={<UserCheck className="h-6 w-6" />}
      />
      
      <CustomerStatCard
        title="Top Location"
        value={stats.topLocation}
        bgColor="bg-purple-500"
        icon={<MapPin className="h-6 w-6" />}
      />
      
      {stats.growth !== undefined && (
        <CustomerStatCard
          title="Growth Rate"
          value={`${stats.growth > 0 ? '+' : ''}${stats.growth}%`}
          bgColor={stats.growth >= 0 ? 'bg-green-500' : 'bg-red-500'}
          icon={<TrendingUp className="h-6 w-6" />}
        />
      )}
    </div>
  );
};
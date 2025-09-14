// Order Stats Section - Molecule
// Dashboard cards showing order statistics

import React from 'react';
import { OrderStatCard } from '../atoms/order-stat-card';
import { Package, CheckCircle, Truck, RotateCcw, AlertCircle } from 'lucide-react';

interface OrderStatsData {
  totalOrders: number;
  deliveredOrders: number;
  inTransitOrders: number;
  pendingOrders: number;
  cancelledOrders?: number;
  totalRevenue?: number;
}

interface OrderStatsSectionProps {
  stats: OrderStatsData;
  isLoading?: boolean;
}

export const OrderStatsSection: React.FC<OrderStatsSectionProps> = ({ 
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

  const deliveryRate = stats.totalOrders > 0 
    ? ((stats.deliveredOrders / stats.totalOrders) * 100).toFixed(1)
    : '0';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <OrderStatCard
        title="Total Orders"
        value={stats.totalOrders}
        bgColor="bg-blue-500"
        icon={<Package className="h-6 w-6" />}
      />
      
      <OrderStatCard
        title="Delivered"
        value={stats.deliveredOrders}
        bgColor="bg-green-500"
        icon={<CheckCircle className="h-6 w-6" />}
        trend={{
          value: parseFloat(deliveryRate),
          isPositive: true,
        }}
      />
      
      <OrderStatCard
        title="In Transit"
        value={stats.inTransitOrders}
        bgColor="bg-orange-500"
        icon={<Truck className="h-6 w-6" />}
      />
      
      <OrderStatCard
        title="Pending"
        value={stats.pendingOrders}
        bgColor="bg-yellow-500"
        icon={<AlertCircle className="h-6 w-6" />}
      />

      {stats.cancelledOrders !== undefined && (
        <OrderStatCard
          title="Cancelled"
          value={stats.cancelledOrders}
          bgColor="bg-red-500"
          icon={<RotateCcw className="h-6 w-6" />}
        />
      )}

      {stats.totalRevenue !== undefined && (
        <OrderStatCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          bgColor="bg-purple-500"
          icon={<Package className="h-6 w-6" />}
        />
      )}
    </div>
  );
};
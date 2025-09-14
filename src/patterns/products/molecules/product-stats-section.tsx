// Product Stats Section - Molecule
// Dashboard cards showing product statistics with donut chart

import React from 'react';
import { OrderStatCard } from '../../orders/atoms/order-stat-card';
import { Package, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface ProductStatsData {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  outOfStockProducts: number;
  lowStockProducts?: number;
  draftProducts?: number;
  categoryBreakdown?: {
    male: number;
    female: number;
    unisex?: number;
  };
}

interface ProductStatsSectionProps {
  stats: ProductStatsData;
  isLoading?: boolean;
}

export const ProductStatsSection: React.FC<ProductStatsSectionProps> = ({ 
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

  const activeRate = stats.totalProducts > 0 
    ? ((stats.activeProducts / stats.totalProducts) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <OrderStatCard
          title="Total Products"
          value={stats.totalProducts}
          bgColor="bg-blue-500"
          icon={<Package className="h-6 w-6" />}
        />
        
        <OrderStatCard
          title="Active Products"
          value={stats.activeProducts}
          bgColor="bg-green-500"
          icon={<CheckCircle className="h-6 w-6" />}
          trend={{
            value: parseFloat(activeRate),
            isPositive: true,
          }}
        />
        
        <OrderStatCard
          title="Out of Stock"
          value={stats.outOfStockProducts}
          bgColor="bg-red-500"
          icon={<XCircle className="h-6 w-6" />}
        />
        
        <OrderStatCard
          title="Low Stock"
          value={stats.lowStockProducts || 0}
          bgColor="bg-orange-500"
          icon={<AlertTriangle className="h-6 w-6" />}
        />
      </div>

      {/* Category Breakdown Chart */}
      {stats.categoryBreakdown && (
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Products by Category
              </h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span className="text-sm text-gray-600">
                    Male: {stats.categoryBreakdown.male} products
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-pink-500 rounded"></div>
                  <span className="text-sm text-gray-600">
                    Female: {stats.categoryBreakdown.female} products
                  </span>
                </div>
                {stats.categoryBreakdown.unisex && (
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-purple-500 rounded"></div>
                    <span className="text-sm text-gray-600">
                      Unisex: {stats.categoryBreakdown.unisex} products
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Simple visual representation */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-8 border-gray-200 relative overflow-hidden">
                <div 
                  className="absolute inset-0 bg-blue-500"
                  style={{
                    clipPath: `polygon(50% 50%, 50% 0%, ${50 + (stats.categoryBreakdown.male / stats.totalProducts) * 50}% 0%, 50% 50%)`
                  }}
                ></div>
                <div 
                  className="absolute inset-0 bg-pink-500"
                  style={{
                    clipPath: `polygon(50% 50%, ${50 + (stats.categoryBreakdown.male / stats.totalProducts) * 50}% 0%, 100% 50%, 50% 50%)`
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
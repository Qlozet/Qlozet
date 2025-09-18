// Orders Page Template - Template
// Complete page layout for orders management with all components

import React, { useState } from 'react';
import { show } from '@ebay/nice-modal-react';
import { OrderStatsSection } from '../molecules/order-stats-section';
import { OrderSearchFilter } from '../molecules/order-search-filter';
import { OrdersTable } from '../organisms/orders-table';
import { OrderDetailsModal } from '../organisms/order-details-modal';
import { CustomerDetailsModal } from '../../customers/organisms/customer-details-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  useGetOrdersQuery,
  useGetOrderStatsQuery,
} from '@/redux/services/orders/orders.api-slice';
import { OrderFilterData } from '@/lib/validations/order';
import { Plus, Download, Upload, FileText, Truck } from 'lucide-react';
import Typography from '@/components/compat/Typography';

interface OrdersPageTemplateProps {
  title?: string;
  showCreateButton?: boolean;
  showBulkActions?: boolean;
  onCreateOrder?: () => void;
  onImportOrders?: () => void;
  onExportOrders?: () => void;
  onGenerateReport?: () => void;
}

export const OrdersPageTemplate: React.FC<OrdersPageTemplateProps> = ({
  title = 'Orders',
  showCreateButton = true,
  showBulkActions = true,
  onCreateOrder,
  onImportOrders,
  onExportOrders,
  onGenerateReport,
}) => {
  // State for filters and pagination
  const [filters, setFilters] = useState<OrderFilterData>({
    search: '',
    status: 'all',
    paymentStatus: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 20,
  });

  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  // API queries
  const {
    data: ordersResponse,
    isLoading: loadingOrders,
    error: ordersError,
    refetch: refetchOrders,
  } = useGetOrdersQuery(filters);

  const { data: statsResponse, isLoading: loadingStats } =
    useGetOrderStatsQuery();

  const orders = ordersResponse?.data || [];
  const totalPages = ordersResponse?.totalPages || 1;
  const totalCount = ordersResponse?.totalCount || 0;
  const stats = statsResponse?.data;

  // Handle filter changes
  const handleFilter = (newFilters: OrderFilterData) => {
    setFilters({ ...newFilters, page: 1 });
    setSelectedOrders([]);
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      paymentStatus: 'all',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      page: 1,
      limit: 20,
    });
    setSelectedOrders([]);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  // Handle sorting
  const handleSort = (
    field: keyof (typeof orders)[0],
    direction: 'asc' | 'desc'
  ) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: field as any,
      sortOrder: direction,
      page: 1,
    }));
  };

  // Handle order selection
  const handleSelectOrder = (orderId: string, selected: boolean) => {
    setSelectedOrders((prev) =>
      selected ? [...prev, orderId] : prev.filter((id) => id !== orderId)
    );
  };

  const handleSelectAll = (selected: boolean) => {
    setSelectedOrders(selected ? orders.map((o) => o._id) : []);
  };

  // Handle order details modal
  const handleViewDetails = (orderId: string) => {
    show(OrderDetailsModal, {
      orderId,
      onOrderUpdated: () => refetchOrders(),
    });
  };

  // Handle customer details modal
  const handleViewCustomer = (customerId: string) => {
    show(CustomerDetailsModal, { customerId });
  };

  // Handle bulk actions
  const handleBulkAction = (
    action: 'confirm' | 'ship' | 'cancel' | 'export'
  ) => {
    if (selectedOrders.length === 0) return;

    // Implement bulk actions here
    console.log(`Bulk ${action} for orders:`, selectedOrders);

    // Clear selection after action
    setSelectedOrders([]);
  };

  // Prepare stats data
  const statsData = stats
    ? {
        totalOrders: stats.totalOrders || totalCount,
        deliveredOrders: stats.completedOrders || 0,
        inTransitOrders: stats.pendingOrders || 0,
        pendingOrders: stats.pendingOrders || 0,
        cancelledOrders: stats.cancelledOrders || 0,
        totalRevenue: stats.totalRevenue || 0,
      }
    : {
        totalOrders: totalCount,
        deliveredOrders: 0,
        inTransitOrders: 0,
        pendingOrders: 0,
      };

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-7xl mx-auto p-6 space-y-6'>
        {/* Header */}
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
          <div>
            <Typography
              variant='h1'
              className='text-2xl font-bold text-gray-900'
            >
              {title}
            </Typography>
            <Typography variant='body2' className='text-gray-600 mt-1'>
              Manage orders and track their fulfillment status
            </Typography>
          </div>

          <div className='flex items-center space-x-2'>
            {showBulkActions && (
              <>
                <Button
                  variant='outline'
                  onClick={onGenerateReport}
                  className='flex items-center space-x-2'
                >
                  <FileText className='h-4 w-4' />
                  <span>Report</span>
                </Button>

                <Button
                  variant='outline'
                  onClick={onImportOrders}
                  className='flex items-center space-x-2'
                >
                  <Upload className='h-4 w-4' />
                  <span>Import</span>
                </Button>

                <Button
                  variant='outline'
                  onClick={onExportOrders}
                  className='flex items-center space-x-2'
                >
                  <Download className='h-4 w-4' />
                  <span>Export</span>
                </Button>
              </>
            )}

            {showCreateButton && (
              <Button
                onClick={onCreateOrder}
                className='flex items-center space-x-2'
              >
                <Plus className='h-4 w-4' />
                <span>New Order</span>
              </Button>
            )}
          </div>
        </div>

        {/* Stats Section */}
        <OrderStatsSection stats={statsData} isLoading={loadingStats} />

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <OrderSearchFilter
              onFilter={handleFilter}
              onReset={handleResetFilters}
              isLoading={loadingOrders}
              initialFilters={filters}
            />
          </CardContent>
        </Card>

        {/* Bulk Actions Bar */}
        {showBulkActions && selectedOrders.length > 0 && (
          <Card>
            <CardContent className='py-4'>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-gray-600'>
                  {selectedOrders.length} order
                  {selectedOrders.length !== 1 ? 's' : ''} selected
                </span>

                <div className='flex items-center space-x-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => handleBulkAction('confirm')}
                    className='flex items-center space-x-1'
                  >
                    <span>Confirm</span>
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => handleBulkAction('ship')}
                    className='flex items-center space-x-1'
                  >
                    <Truck className='h-3 w-3' />
                    <span>Ship</span>
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => handleBulkAction('export')}
                  >
                    Export Selected
                  </Button>
                  <Button
                    variant='destructive'
                    size='sm'
                    onClick={() => handleBulkAction('cancel')}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Orders Table */}
        <Card>
          <CardContent className='p-0'>
            <OrdersTable
              orders={orders}
              onViewDetails={handleViewDetails}
              onViewCustomer={handleViewCustomer}
              onSort={handleSort}
              sortField={filters.sortBy}
              sortDirection={filters.sortOrder}
              isLoading={loadingOrders}
              showSelection={showBulkActions}
              selectedOrders={selectedOrders}
              onSelectOrder={handleSelectOrder}
              onSelectAll={handleSelectAll}
            />
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className='flex items-center justify-between'>
            <div className='text-sm text-gray-600'>
              Showing {(filters.page - 1) * filters.limit + 1} to{' '}
              {Math.min(filters.page * filters.limit, totalCount)} of{' '}
              {totalCount} orders
            </div>

            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      handlePageChange(Math.max(1, filters.page - 1))
                    }
                    className={
                      filters.page === 1
                        ? 'pointer-events-none opacity-50'
                        : 'cursor-pointer'
                    }
                  />
                </PaginationItem>

                {[...Array(totalPages)].map((_, index) => {
                  const page = index + 1;
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= filters.page - 1 && page <= filters.page + 1)
                  ) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => handlePageChange(page)}
                          isActive={filters.page === page}
                          className='cursor-pointer'
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }
                  return null;
                })}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      handlePageChange(Math.min(totalPages, filters.page + 1))
                    }
                    className={
                      filters.page === totalPages
                        ? 'pointer-events-none opacity-50'
                        : 'cursor-pointer'
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        {/* Error handling */}
        {ordersError && (
          <Card>
            <CardContent className='p-6 text-center'>
              <p className='text-red-600 mb-4'>Failed to load orders</p>
              <Button onClick={() => refetchOrders()} variant='outline'>
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

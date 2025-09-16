// Customers Page Template - Template
// Complete page layout for customers management with all components

import React, { useState, useEffect } from 'react';
import { show } from '@ebay/nice-modal-react';
import { CustomerStatsSection } from '../molecules/customer-stats-section';
import { CustomerSearchFilter } from '../molecules/customer-search-filter';
import { CustomersTable } from '../organisms/customers-table';
import { CustomerDetailsModal } from '../organisms/customer-details-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useGetCustomersQuery, useGetCustomerStatsQuery } from '@/redux/services/customers/customers.api-slice';
import { CustomerFilterData } from '@/lib/validations/customer';
import { Plus, Download, Upload } from 'lucide-react';
import Typography from '@/components/compat/Typography';

interface CustomersPageTemplateProps {
  title?: string;
  showCreateButton?: boolean;
  showBulkActions?: boolean;
  onCreateCustomer?: () => void;
  onImportCustomers?: () => void;
  onExportCustomers?: () => void;
}

export const CustomersPageTemplate: React.FC<CustomersPageTemplateProps> = ({
  title = "Customers",
  showCreateButton = true,
  showBulkActions = true,
  onCreateCustomer,
  onImportCustomers,
  onExportCustomers,
}) => {
  // State for filters and pagination
  const [filters, setFilters] = useState<CustomerFilterData>({
    search: '',
    status: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 20,
  });

  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);

  // API queries
  const { 
    data: customersResponse, 
    isLoading: loadingCustomers, 
    error: customersError,
    refetch: refetchCustomers,
  } = useGetCustomersQuery(filters);

  const { 
    data: statsResponse, 
    isLoading: loadingStats 
  } = useGetCustomerStatsQuery();

  const customers = customersResponse?.data || [];
  const totalPages = customersResponse?.totalPages || 1;
  const totalCount = customersResponse?.totalCount || 0;
  const stats = statsResponse?.data;

  // Handle filter changes
  const handleFilter = (newFilters: CustomerFilterData) => {
    setFilters({ ...newFilters, page: 1 });
    setSelectedCustomers([]);
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      page: 1,
      limit: 20,
    });
    setSelectedCustomers([]);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  // Handle sorting
  const handleSort = (field: keyof typeof customers[0], direction: 'asc' | 'desc') => {
    setFilters(prev => ({ 
      ...prev, 
      sortBy: field as any,
      sortOrder: direction,
      page: 1 
    }));
  };

  // Handle customer selection
  const handleSelectCustomer = (customerId: string, selected: boolean) => {
    setSelectedCustomers(prev => 
      selected 
        ? [...prev, customerId]
        : prev.filter(id => id !== customerId)
    );
  };

  const handleSelectAll = (selected: boolean) => {
    setSelectedCustomers(selected ? customers.map(c => c._id) : []);
  };

  // Handle customer details modal
  const handleViewDetails = (customerId: string) => {
    show(CustomerDetailsModal, { customerId });
  };

  // Handle bulk actions
  const handleBulkAction = (action: 'activate' | 'deactivate' | 'delete' | 'export') => {
    if (selectedCustomers.length === 0) return;
    
    // Implement bulk actions here
    console.log(`Bulk ${action} for customers:`, selectedCustomers);
    
    // Clear selection after action
    setSelectedCustomers([]);
  };

  // Prepare stats data
  const statsData = stats ? {
    totalCustomers: stats.totalCustomers || totalCount,
    activeCustomers: stats.activeCustomers || 0,
    topLocation: 'Lagos State', // This would come from stats API
    growth: 12.5, // This would come from stats API
  } : {
    totalCustomers: totalCount,
    activeCustomers: 0,
    topLocation: 'Loading...',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Typography 
              variant="h1" 
              className="text-2xl font-bold text-gray-900"
            >
              {title}
            </Typography>
            <Typography 
              variant="body2" 
              className="text-gray-600 mt-1"
            >
              Manage your customers and view their details
            </Typography>
          </div>

          <div className="flex items-center space-x-2">
            {showBulkActions && (
              <>
                <Button 
                  variant="outline" 
                  onClick={onImportCustomers}
                  className="flex items-center space-x-2"
                >
                  <Upload className="h-4 w-4" />
                  <span>Import</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={onExportCustomers}
                  className="flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </Button>
              </>
            )}

            {showCreateButton && (
              <Button 
                onClick={onCreateCustomer}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Customer</span>
              </Button>
            )}
          </div>
        </div>

        {/* Stats Section */}
        <CustomerStatsSection 
          stats={statsData} 
          isLoading={loadingStats} 
        />

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <CustomerSearchFilter
              onFilter={handleFilter}
              onReset={handleResetFilters}
              isLoading={loadingCustomers}
              initialFilters={filters}
            />
          </CardContent>
        </Card>

        {/* Bulk Actions Bar */}
        {showBulkActions && selectedCustomers.length > 0 && (
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {selectedCustomers.length} customer{selectedCustomers.length !== 1 ? 's' : ''} selected
                </span>
                
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleBulkAction('activate')}
                  >
                    Activate
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleBulkAction('deactivate')}
                  >
                    Deactivate
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleBulkAction('export')}
                  >
                    Export Selected
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleBulkAction('delete')}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Customer Table */}
        <Card>
          <CardContent className="p-0">
            <CustomersTable
              customers={customers}
              onViewDetails={handleViewDetails}
              onSort={handleSort}
              sortField={filters.sortBy}
              sortDirection={filters.sortOrder}
              isLoading={loadingCustomers}
              showSelection={showBulkActions}
              selectedCustomers={selectedCustomers}
              onSelectCustomer={handleSelectCustomer}
              onSelectAll={handleSelectAll}
            />
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {((filters.page - 1) * filters.limit) + 1} to{' '}
              {Math.min(filters.page * filters.limit, totalCount)} of {totalCount} customers
            </div>
            
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => handlePageChange(Math.max(1, filters.page - 1))}
                    className={filters.page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
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
                          className="cursor-pointer"
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
                    onClick={() => handlePageChange(Math.min(totalPages, filters.page + 1))}
                    className={filters.page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        {/* Error handling */}
        {customersError && (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-red-600 mb-4">Failed to load customers</p>
              <Button onClick={() => refetchCustomers()} variant="outline">
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
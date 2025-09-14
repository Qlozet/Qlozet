// Products Page Template - Template
// Complete page layout for products management with all components

import React, { useState } from 'react';
import { show } from '@ebay/nice-modal-react';
import { ProductStatsSection } from '../molecules/product-stats-section';
import { ProductSearchFilter, ProductFilterData } from '../molecules/product-search-filter';
import { ProductsTable } from '../organisms/products-table';
import { ProductDetailsModal } from '../organisms/product-details-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useGetProductsQuery, useGetCategoriesQuery, useUpdateProductMutation } from '@/redux/services/products/products.api-slice';
import { Plus, Download, Upload, FileText, Package } from 'lucide-react';
import Typography from '@/components/Typography';
import { toast } from 'react-hot-toast';

interface ProductsPageTemplateProps {
  title?: string;
  showCreateButton?: boolean;
  showBulkActions?: boolean;
  onCreateProduct?: () => void;
  onImportProducts?: () => void;
  onExportProducts?: () => void;
  onGenerateReport?: () => void;
}

export const ProductsPageTemplate: React.FC<ProductsPageTemplateProps> = ({
  title = "Products",
  showCreateButton = true,
  showBulkActions = true,
  onCreateProduct,
  onImportProducts,
  onExportProducts,
  onGenerateReport,
}) => {
  // State for filters and pagination
  const [filters, setFilters] = useState<ProductFilterData>({
    search: '',
    status: 'all',
    category: '',
    tag: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 20,
  });

  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  // API queries
  const { 
    data: productsResponse, 
    isLoading: loadingProducts, 
    error: productsError,
    refetch: refetchProducts,
  } = useGetProductsQuery(filters);

  const { data: categoriesResponse } = useGetCategoriesQuery();
  const [updateProduct] = useUpdateProductMutation();

  const products = productsResponse?.data || [];
  const totalPages = productsResponse?.totalPages || 1;
  const totalCount = productsResponse?.totalCount || 0;
  const categories = categoriesResponse || [];

  // Handle filter changes
  const handleFilter = (newFilters: ProductFilterData) => {
    setFilters({ ...newFilters, page: 1 });
    setSelectedProducts([]);
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      category: '',
      tag: 'all',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      page: 1,
      limit: 20,
    });
    setSelectedProducts([]);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  // Handle sorting
  const handleSort = (field: keyof typeof products[0], direction: 'asc' | 'desc') => {
    setFilters(prev => ({ 
      ...prev, 
      sortBy: field as any,
      sortOrder: direction,
      page: 1 
    }));
  };

  // Handle product selection
  const handleSelectProduct = (productId: string, selected: boolean) => {
    setSelectedProducts(prev => 
      selected 
        ? [...prev, productId]
        : prev.filter(id => id !== productId)
    );
  };

  const handleSelectAll = (selected: boolean) => {
    setSelectedProducts(selected ? products.map(p => p._id) : []);
  };

  // Handle product actions
  const handleViewDetails = (productId: string) => {
    show(ProductDetailsModal, { 
      productId,
      onProductUpdated: () => refetchProducts(),
      onProductDeleted: () => refetchProducts(),
      onEdit: (id: string) => {
        // Navigate to edit page or show edit modal
        window.location.href = `/add?edit=${id}`;
      },
      onDuplicate: async (id: string) => {
        // TODO: Implement product duplication
        toast.success('Product duplication will be implemented');
      },
    });
  };

  const handleEditProduct = (productId: string) => {
    // Navigate to edit page
    window.location.href = `/add?edit=${productId}`;
  };

  const handleDuplicateProduct = (productId: string) => {
    // TODO: Implement product duplication
    toast.success('Product duplication will be implemented');
  };

  const handleStatusChange = async (productId: string, isActive: boolean) => {
    try {
      const newStatus = isActive ? 'active' : 'inactive';
      await updateProduct({
        _id: productId,
        status: newStatus,
      }).unwrap();

      toast.success(`Product ${isActive ? 'activated' : 'deactivated'} successfully`);
      refetchProducts();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to update product status');
    }
  };

  // Handle bulk actions
  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete' | 'export') => {
    if (selectedProducts.length === 0) return;
    
    try {
      switch (action) {
        case 'activate':
        case 'deactivate':
          const status = action === 'activate' ? 'active' : 'inactive';
          await Promise.all(
            selectedProducts.map(productId =>
              updateProduct({ _id: productId, status }).unwrap()
            )
          );
          toast.success(`${selectedProducts.length} products ${action}d successfully`);
          break;
        case 'delete':
          if (!confirm(`Are you sure you want to delete ${selectedProducts.length} products?`)) {
            return;
          }
          // TODO: Implement bulk delete
          toast.success('Bulk delete will be implemented');
          break;
        case 'export':
          // TODO: Implement bulk export
          toast.success('Bulk export will be implemented');
          break;
      }
      
      setSelectedProducts([]);
      refetchProducts();
    } catch (error: any) {
      toast.error(`Failed to ${action} products`);
    }
  };

  // Prepare stats data
  const statsData = {
    totalProducts: totalCount,
    activeProducts: products.filter(p => p.status === 'active').length,
    inactiveProducts: products.filter(p => p.status === 'inactive').length,
    outOfStockProducts: products.filter(p => p.status === 'out_of_stock' || p.stock === 0).length,
    lowStockProducts: products.filter(p => p.stock <= 10 && p.stock > 0).length,
    draftProducts: products.filter(p => p.status === 'draft').length,
    categoryBreakdown: {
      male: products.filter(p => p.tags.includes('male')).length,
      female: products.filter(p => p.tags.includes('female')).length,
      unisex: products.filter(p => p.tags.includes('unisex')).length,
    },
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
              Manage your product inventory and catalog
            </Typography>
          </div>

          <div className="flex items-center space-x-2">
            {showBulkActions && (
              <>
                <Button 
                  variant="outline" 
                  onClick={onGenerateReport}
                  className="flex items-center space-x-2"
                >
                  <FileText className="h-4 w-4" />
                  <span>Report</span>
                </Button>

                <Button 
                  variant="outline" 
                  onClick={onImportProducts}
                  className="flex items-center space-x-2"
                >
                  <Upload className="h-4 w-4" />
                  <span>Import</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={onExportProducts}
                  className="flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </Button>
              </>
            )}

            {showCreateButton && (
              <Button 
                onClick={onCreateProduct}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>New Product</span>
              </Button>
            )}
          </div>
        </div>

        {/* Stats Section */}
        <ProductStatsSection 
          stats={statsData} 
          isLoading={loadingProducts} 
        />

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Products</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductSearchFilter
              onFilter={handleFilter}
              onReset={handleResetFilters}
              isLoading={loadingProducts}
              initialFilters={filters}
              categories={categories}
            />
          </CardContent>
        </Card>

        {/* Bulk Actions Bar */}
        {showBulkActions && selectedProducts.length > 0 && (
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected
                </span>
                
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleBulkAction('activate')}
                    className="flex items-center space-x-1"
                  >
                    <span>Activate</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleBulkAction('deactivate')}
                    className="flex items-center space-x-1"
                  >
                    <span>Deactivate</span>
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

        {/* Products Table */}
        <Card>
          <CardContent className="p-0">
            <ProductsTable
              products={products}
              onViewDetails={handleViewDetails}
              onEdit={handleEditProduct}
              onDuplicate={handleDuplicateProduct}
              onStatusChange={handleStatusChange}
              onSort={handleSort}
              sortField={filters.sortBy}
              sortDirection={filters.sortOrder}
              isLoading={loadingProducts}
              showSelection={showBulkActions}
              selectedProducts={selectedProducts}
              onSelectProduct={handleSelectProduct}
              onSelectAll={handleSelectAll}
            />
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {((filters.page - 1) * filters.limit) + 1} to{' '}
              {Math.min(filters.page * filters.limit, totalCount)} of {totalCount} products
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
        {productsError && (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-red-600 mb-4">Failed to load products</p>
              <Button onClick={() => refetchProducts()} variant="outline">
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
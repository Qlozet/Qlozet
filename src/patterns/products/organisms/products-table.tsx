// Products Table - Organism
// Complete table component for displaying product list with sorting and pagination

import React, { useState } from 'react';
import { ProductTableRow } from '../molecules/product-table-row';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

interface ProductVariant {
  _id: string;
  size?: string;
  color?: string;
  material?: string;
  additionalPrice: number;
  stock: number;
}

interface Product {
  _id: string;
  name: string;
  images: string[];
  price: number;
  stock: number;
  status: 'draft' | 'active' | 'inactive' | 'out_of_stock';
  category: string;
  tags: string[];
  variants?: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}

interface ProductsTableProps {
  products: Product[];
  onViewDetails: (productId: string) => void;
  onEdit: (productId: string) => void;
  onDuplicate?: (productId: string) => void;
  onStatusChange: (productId: string, newStatus: boolean) => void;
  onSort?: (field: keyof Product, direction: 'asc' | 'desc') => void;
  sortField?: keyof Product;
  sortDirection?: 'asc' | 'desc';
  isLoading?: boolean;
  showSelection?: boolean;
  selectedProducts?: string[];
  onSelectProduct?: (productId: string, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
}

export const ProductsTable: React.FC<ProductsTableProps> = ({
  products,
  onViewDetails,
  onEdit,
  onDuplicate,
  onStatusChange,
  onSort,
  sortField,
  sortDirection,
  isLoading = false,
  showSelection = false,
  selectedProducts = [],
  onSelectProduct,
  onSelectAll,
}) => {
  const [localSortField, setLocalSortField] = useState<keyof Product>('createdAt');
  const [localSortDirection, setLocalSortDirection] = useState<'asc' | 'desc'>('desc');

  const currentSortField = sortField || localSortField;
  const currentSortDirection = sortDirection || localSortDirection;

  const handleSort = (field: keyof Product) => {
    const newDirection = 
      currentSortField === field && currentSortDirection === 'asc' ? 'desc' : 'asc';
    
    if (onSort) {
      onSort(field, newDirection);
    } else {
      setLocalSortField(field);
      setLocalSortDirection(newDirection);
    }
  };

  const getSortIcon = (field: keyof Product) => {
    if (currentSortField !== field) {
      return <ChevronsUpDown className="ml-2 h-4 w-4" />;
    }
    return currentSortDirection === 'asc' 
      ? <ChevronUp className="ml-2 h-4 w-4" />
      : <ChevronDown className="ml-2 h-4 w-4" />;
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSelectAll?.(event.target.checked);
  };

  const allSelected = selectedProducts.length === products.length && products.length > 0;
  const someSelected = selectedProducts.length > 0 && selectedProducts.length < products.length;

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-100 border-b" />
          {[...Array(5)].map((_, index) => (
            <div key={index} className="h-20 bg-gray-50 border-b border-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <p className="text-gray-500 text-lg">No products found</p>
        <p className="text-gray-400 text-sm mt-2">
          Try adjusting your search or filter criteria
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            {showSelection && (
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </TableHead>
            )}

            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort('name')}
                className="h-auto p-0 font-medium text-left justify-start hover:bg-transparent"
              >
                Product
                {getSortIcon('name')}
              </Button>
            </TableHead>

            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort('price')}
                className="h-auto p-0 font-medium text-left justify-start hover:bg-transparent"
              >
                Price
                {getSortIcon('price')}
              </Button>
            </TableHead>

            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort('stock')}
                className="h-auto p-0 font-medium text-left justify-start hover:bg-transparent"
              >
                Stock
                {getSortIcon('stock')}
              </Button>
            </TableHead>

            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort('status')}
                className="h-auto p-0 font-medium text-left justify-start hover:bg-transparent"
              >
                Status
                {getSortIcon('status')}
              </Button>
            </TableHead>

            <TableHead>Tags</TableHead>

            <TableHead>Variants</TableHead>

            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort('createdAt')}
                className="h-auto p-0 font-medium text-left justify-start hover:bg-transparent"
              >
                Created
                {getSortIcon('createdAt')}
              </Button>
            </TableHead>

            <TableHead>Active</TableHead>

            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {products.map((product) => (
            <ProductTableRow
              key={product._id}
              product={product}
              onViewDetails={onViewDetails}
              onEdit={onEdit}
              onDuplicate={onDuplicate}
              onStatusChange={onStatusChange}
              isSelected={selectedProducts.includes(product._id)}
              onSelect={showSelection ? onSelectProduct : undefined}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
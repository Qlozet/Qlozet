'use client';

import { useCallback } from 'react';
import type { OnChangeFn, PaginationState } from '@tanstack/react-table';
import { toast } from 'sonner';
import { TableToolbar } from '@/pattern/common/molecules/table-toolbar';
import { downloadCsv, toCsv } from '@/lib/csv';
import {
  formatPricePerYard,
  getFabricColour,
  getFabricPattern,
  getFabricSubCategory,
  getFabricYards,
  getProductName,
  getProductStatus,
  getProductVendorName,
} from '@/lib/products';
import { FabricProductsTable } from '../organisms/fabric-products-table';
import {
  ProductFiltersControl,
  type ProductFilters,
} from '../molecules/product-filters';
import { useProductRowActions } from '../hooks/use-product-row-actions';
import type { Product } from '@/redux/services/products/products.api-slice';
import type { AdminProductFilterOptions } from '@/redux/services/products/admin-products.api-slice';

interface FabricProductsTemplateProps {
  products: Product[];
  isLoading: boolean;
  isFetching: boolean;
  isSuccess: boolean;
  isError: boolean;
  error?: unknown;
  search: string;
  onSearchChange: (value: string) => void;
  pagination: PaginationState;
  setPagination: OnChangeFn<PaginationState>;
  pageCount: number;
  /** Rows across every page, so the footer can report a real total. */
  totalRows?: number;
  filters: ProductFilters;
  onFiltersChange: (filters: ProductFilters) => void;
  filterOptions?: AdminProductFilterOptions;
  isLoadingFilters?: boolean;
}

const CSV_HEADERS = [
  'Product name',
  'Vendor',
  'Price per yard',
  'Sub category',
  'Pattern',
  'Colour',
  'Yards',
  'Status',
];

const toCsvRow = (product: Product) => [
  getProductName(product),
  getProductVendorName(product),
  formatPricePerYard(product),
  getFabricSubCategory(product),
  getFabricPattern(product),
  getFabricColour(product),
  String(getFabricYards(product)),
  getProductStatus(product).label,
];

export const FabricProductsTemplate = ({
  products,
  isLoading,
  isFetching,
  isSuccess,
  isError,
  error,
  search,
  onSearchChange,
  pagination,
  setPagination,
  pageCount,
  totalRows,
  filters,
  onFiltersChange,
  filterOptions,
  isLoadingFilters,
}: FabricProductsTemplateProps) => {
  const handleAction = useProductRowActions();

  const handleExport = useCallback(() => {
    if (products.length === 0) {
      toast.info('There is nothing to export.');
      return;
    }
    downloadCsv('fabrics.csv', toCsv(CSV_HEADERS, products.map(toCsvRow)));
  }, [products]);

  return (
    <FabricProductsTable
      data={products}
      isLoading={isLoading}
      isFetching={isFetching}
      isSuccess={isSuccess}
      isError={isError}
      error={error}
      pagination={pagination}
      setPagination={setPagination}
      pageCount={pageCount}
      totalRows={totalRows}
      onAction={handleAction}
      toolbar={
        <TableToolbar
          title="Fabric"
          search={search}
          onSearchChange={onSearchChange}
          onExport={handleExport}
          filterControl={
            <ProductFiltersControl
              value={filters}
              onChange={onFiltersChange}
              options={filterOptions}
              isLoading={isLoadingFilters}
            />
          }
        />
      }
    />
  );
};

'use client';

import { useCallback } from 'react';
import type { OnChangeFn, PaginationState } from '@tanstack/react-table';
import { toast } from 'sonner';
import { TableToolbar } from '@/pattern/common/molecules/table-toolbar';
import { downloadCsv, toCsv } from '@/lib/csv';
import {
  formatProductPrice,
  getProductCategory,
  getProductName,
  getProductQuantity,
  getProductStatus,
  getProductTags,
  getProductType,
  getProductVendorName,
} from '@/lib/products';
import { VariantProductsTable } from '../organisms/variant-products-table';
import {
  ProductFiltersControl,
  type ProductFilters,
} from '../molecules/product-filters';
import { useProductRowActions } from '../hooks/use-product-row-actions';
import type { Product } from '@/redux/services/products/products.api-slice';
import type { AdminProductFilterOptions } from '@/redux/services/products/admin-products.api-slice';

interface VariantProductsTemplateProps {
  /** Toolbar heading, e.g. "Clothing" or "Accessories". */
  title: string;
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
  emptyMessage?: string;
  filters: ProductFilters;
  onFiltersChange: (filters: ProductFilters) => void;
  filterOptions?: AdminProductFilterOptions;
  isLoadingFilters?: boolean;
  /** Filename stem for the CSV export, e.g. "clothing". */
  exportName?: string;
}

const CSV_HEADERS = [
  'Product name',
  'Vendor',
  'Price',
  'Category',
  'Product type',
  'Tags',
  'Stock',
  'Variants',
  'Status',
];

const toCsvRow = (product: Product) => {
  const { stock, variantCount } = getProductQuantity(product);
  return [
    getProductName(product),
    getProductVendorName(product),
    formatProductPrice(product),
    getProductCategory(product),
    getProductType(product),
    getProductTags(product).join(' | '),
    String(stock),
    String(variantCount),
    getProductStatus(product).label,
  ];
};

// Toolbar + table for any product-with-variants catalogue. Clothing and
// Accessories differ only by the toolbar title and empty-state copy.
export const VariantProductsTemplate = ({
  title,
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
  emptyMessage,
  totalRows,
  filters,
  onFiltersChange,
  filterOptions,
  isLoadingFilters,
  exportName = 'products',
}: VariantProductsTemplateProps) => {
  const handleAction = useProductRowActions();

  const handleExport = useCallback(() => {
    if (products.length === 0) {
      toast.info('There is nothing to export.');
      return;
    }
    // This page only: the list endpoint has no "all rows" mode, and walking
    // every page to build one file would hammer it.
    downloadCsv(
      `${exportName}.csv`,
      toCsv(CSV_HEADERS, products.map(toCsvRow))
    );
  }, [products, exportName]);

  return (
    <VariantProductsTable
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
      emptyMessage={emptyMessage}
      toolbar={
        <TableToolbar
          title={title}
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

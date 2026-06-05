'use client';

import { useMemo } from 'react';
import type { OnChangeFn, PaginationState } from '@tanstack/react-table';
import { DataTable } from '@/pattern/common/organisms/table/data-table';
import { createVariantProductsColumns } from '../molecules/variant-products-columns';
import type { ProductAction } from '../molecules/product-actions-cell';
import type { Product } from '@/redux/services/products/products.api-slice';

interface VariantProductsTableProps {
  data: Product[];
  isLoading: boolean;
  isFetching: boolean;
  isSuccess: boolean;
  isError: boolean;
  error?: unknown;
  pagination: PaginationState;
  setPagination: OnChangeFn<PaginationState>;
  pageCount: number;
  toolbar?: React.ReactNode;
  emptyMessage?: string;
  onAction?: (action: ProductAction, product: Product) => void;
}

export const VariantProductsTable = ({
  data,
  isLoading,
  isFetching,
  isSuccess,
  isError,
  error,
  pagination,
  setPagination,
  pageCount,
  toolbar,
  emptyMessage = 'No products found.',
  onAction,
}: VariantProductsTableProps) => {
  const columns = useMemo(
    () => createVariantProductsColumns({ onAction }),
    [onAction]
  );

  return (
    <DataTable<Product>
      columns={columns}
      data={data}
      isLoading={isLoading}
      isFetching={isFetching}
      isSuccess={isSuccess}
      isError={isError}
      error={error}
      pagination={pagination}
      setPagination={setPagination}
      pageCount={pageCount}
      toolbar={toolbar}
      onRowClick={onAction ? (product) => onAction('view', product) : undefined}
      emptyMessage={emptyMessage}
      minWidth="1100px"
    />
  );
};

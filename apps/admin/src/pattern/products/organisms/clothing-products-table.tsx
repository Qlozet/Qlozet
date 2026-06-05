'use client';

import { useMemo } from 'react';
import type { OnChangeFn, PaginationState } from '@tanstack/react-table';
import { DataTable } from '@/pattern/common/organisms/table/data-table';
import {
  createClothingProductsColumns,
  type ProductAction,
} from '../molecules/clothing-products-columns';
import type { Product } from '@/redux/services/products/products.api-slice';

interface ClothingProductsTableProps {
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
  onAction?: (action: ProductAction, product: Product) => void;
}

export const ClothingProductsTable = ({
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
  onAction,
}: ClothingProductsTableProps) => {
  const columns = useMemo(
    () => createClothingProductsColumns({ onAction }),
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
      emptyMessage="No clothing products found."
      minWidth="1100px"
    />
  );
};

'use client';

import { useMemo } from 'react';
import type { OnChangeFn, PaginationState } from '@tanstack/react-table';
import { DataTable } from '@/pattern/common/organisms/table/data-table';
import { createFabricProductsColumns } from '../molecules/fabric-products-columns';
import type { ProductAction } from '../molecules/product-actions-cell';
import type { Product } from '@/redux/services/products/products.api-slice';

interface FabricProductsTableProps {
  data: Product[];
  isLoading: boolean;
  isFetching: boolean;
  isSuccess: boolean;
  isError: boolean;
  error?: unknown;
  pagination: PaginationState;
  setPagination: OnChangeFn<PaginationState>;
  pageCount: number;
  /** Rows across every page, so the footer can report a real total. */
  totalRows?: number;
  toolbar?: React.ReactNode;
  onAction?: (action: ProductAction, product: Product) => void;
}

export const FabricProductsTable = ({
  data,
  isLoading,
  isFetching,
  isSuccess,
  isError,
  error,
  pagination,
  setPagination,
  pageCount,
  totalRows,
  toolbar,
  onAction,
}: FabricProductsTableProps) => {
  const columns = useMemo(
    () => createFabricProductsColumns({ onAction }),
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
      totalRows={totalRows}
      toolbar={toolbar}
      onRowClick={onAction ? (product) => onAction('view', product) : undefined}
      emptyMessage="No fabric products found."
      minWidth="1100px"
    />
  );
};

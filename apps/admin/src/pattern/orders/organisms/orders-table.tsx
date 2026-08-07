'use client';

import { useMemo } from 'react';
import type { PaginationState, OnChangeFn } from '@tanstack/react-table';
import { DataTable } from '@/pattern/common/organisms/table/data-table';
import type { AdminOrder } from '@/redux/services/orders/orders.api-slice';
import { createOrdersTableColumns } from '../molecules/orders-table-columns';

interface OrdersTableProps {
  data: AdminOrder[];
  isLoading: boolean;
  isFetching: boolean;
  isSuccess: boolean;
  isError: boolean;
  error?: unknown;
  pagination: PaginationState;
  setPagination: OnChangeFn<PaginationState>;
  pageCount: number;
  onViewDetails: (order: AdminOrder) => void;
  toolbar?: React.ReactNode;
}

export const OrdersTable = ({
  data,
  isLoading,
  isFetching,
  isSuccess,
  isError,
  error,
  pagination,
  setPagination,
  pageCount,
  onViewDetails,
  toolbar,
}: OrdersTableProps) => {
  const columns = useMemo(
    () => createOrdersTableColumns({ onViewDetails }),
    [onViewDetails]
  );

  return (
    <DataTable<AdminOrder>
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
      onRowClick={onViewDetails}
      emptyMessage="No orders found."
      minWidth="1000px"
    />
  );
};

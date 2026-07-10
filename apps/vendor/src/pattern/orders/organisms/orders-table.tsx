'use client';

// Orders Table — Organism
// Built to match the ClothingTable pattern: skeleton loader, data rows,
// "Nothing in here yet" empty state with BoldBoxRemoveIcon, error state,
// and bottom pagination.

import React, { useMemo, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  PaginationState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table';
import { Pagination } from '@/pattern/common/organisms/table/pagination';
import { cn } from '@/lib/utils';
import { BoldBoxRemoveIcon } from '@/pattern/common/atoms/bold-box-remove-icon';
import { Skeleton } from '@/components/ui/skeleton';
import type { Order } from '@/redux/services/orders/orders.api-slice';

interface IOrdersTableProps {
  data: Order[];
  columns: ColumnDef<Order, any>[];
  pageCount?: number;
  pagination?: PaginationState;
  setPagination?: any;
  isLoading: boolean;
  isFetching: boolean;
  isSuccess: boolean;
  error: any;
  isError: boolean;
  onRowClick?: (order: Order) => void;
}

export const OrdersTable = ({
  data,
  columns,
  isLoading,
  isFetching,
  isSuccess,
  error,
  isError,
  pagination,
  pageCount,
  setPagination,
  onRowClick,
}: IOrdersTableProps) => {
  const [rowSelection, setRowSelection] = useState({});

  if (!pagination) {
    pagination = { pageIndex: 0, pageSize: 10 };
  }

  const defaultData = useMemo(() => [], []);

  const ordersTable = useReactTable({
    data: data ?? defaultData,
    columns: columns,
    pageCount: pageCount,
    rowCount: data?.length,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      pagination,
      rowSelection,
    },
    onPaginationChange: setPagination,
    manualPagination: true,
    debugTable: false,
  });

  const showLoader = isLoading || isFetching;
  const skeletonRowCount = pagination?.pageSize || 10;

  return (
    <>
      <div className=''>
        <Table>
          {/* Header */}
          <TableHeader className='bg-[hsla(0,0%,96%,1)] dark:bg-[#4A4949] h-[52px] pt-7 pb-4'>
            {ordersTable.getHeaderGroups()?.map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers?.map((header, index) => {
                  const isFirst = index === 0;
                  const isLast =
                    index === headerGroup.headers?.length - 1;
                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        'h-[52px] pt-7 pb-4 whitespace-nowrap text-grey-black dark:text-white text-sm font-medium',
                        isFirst && 'pl-6',
                        isLast && 'pr-6'
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          {/* Body */}
          <TableBody>
            {/* Loading: skeleton rows that mirror the real table layout */}
            {showLoader &&
              Array.from({ length: skeletonRowCount }).map(
                (_, rowIndex) => (
                  <TableRow
                    key={`skeleton-${rowIndex}`}
                    className='border-b hover:bg-transparent'
                  >
                    {columns.map((_, cellIndex) => {
                      const isFirst = cellIndex === 0;
                      const isLast = cellIndex === columns.length - 1;
                      return (
                        <TableCell
                          key={cellIndex}
                          className={cn(
                            'py-4',
                            isFirst && 'pl-6',
                            isLast && 'pr-6'
                          )}
                        >
                          <Skeleton
                            className={cn(
                              'h-4 rounded-md',
                              isFirst
                                ? 'w-32'
                                : isLast
                                  ? 'w-20'
                                  : 'w-24'
                            )}
                          />
                        </TableCell>
                      );
                    })}
                  </TableRow>
                )
              )}

            {/* Display table rows when data is done loading */}
            {!showLoader && ordersTable.getRowModel().rows?.length > 0 &&
              ordersTable.getRowModel().rows?.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className='border-b cursor-pointer hover:bg-muted/50'
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells()?.map((cell, cellIndex) => {
                    const isFirst = cellIndex === 0;
                    const isLast =
                      cellIndex === row.getVisibleCells()?.length - 1;
                    return (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          'whitespace-nowrap',
                          isFirst && 'pl-6',
                          isLast && 'pr-6'
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}

            {/* Display Message when data is empty */}
            {!showLoader && ordersTable.getRowModel().rows?.length === 0 && !isError && (
              <TableRow>
                <TableCell
                  colSpan={columns?.length}
                  className='h-64 text-center'
                >
                  <div className='flex flex-col items-center gap-4'>
                    <BoldBoxRemoveIcon />
                    <div className='flex flex-col items-center gap-2'>
                      <p className='text-lg font-medium text-muted-foreground'>
                        Nothing in here yet.
                      </p>
                      <p className='text-sm text-muted-foreground'>
                        Orders will show up here once a customer places an order.
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {/* Display error message */}
            {!showLoader && isError && (
              <TableRow>
                <TableCell
                  colSpan={columns?.length}
                  className='h-64 text-center'
                >
                  <div className='flex flex-col items-center gap-2'>
                    <p className='text-lg font-medium text-destructive'>
                      Error loading orders
                    </p>
                    <p className='text-sm text-muted-foreground'>
                      {error?.data?.message || 'Something went wrong'}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {!showLoader &&
        isSuccess &&
        ordersTable.getRowModel().rows?.length > 0 && (
          <div className='py-4'>
            <Pagination table={ordersTable} />
          </div>
        )}
    </>
  );
};

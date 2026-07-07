'use client';

import React, { useMemo } from 'react';
import {
  PaginationState,
  OnChangeFn,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BoldBoxRemoveIcon } from '@/pattern/common/atoms/bold-box-remove-icon';
import type { VendorCustomer } from '@/redux/services/customers/customers.api-slice';
import {
  createCustomersTableColumns,
  type CustomersTableActions,
} from '../molecules/customers-table-columns';

interface CustomersTableProps {
  data: VendorCustomer[];
  isLoading: boolean;
  isFetching: boolean;
  isSuccess: boolean;
  isError: boolean;
  error?: unknown;
  pagination: PaginationState;
  setPagination: OnChangeFn<PaginationState>;
  actions: CustomersTableActions;
  onRowClick: (customer: VendorCustomer) => void;
}

export const CustomersTable = ({
  data,
  isLoading,
  isFetching,
  isSuccess,
  isError,
  error,
  pagination,
  setPagination,
  actions,
  onRowClick,
}: CustomersTableProps) => {
  const defaultData = useMemo<VendorCustomer[]>(() => [], []);

  const columns = useMemo(
    () => createCustomersTableColumns(actions),
    [actions]
  );

  // Data is the full (filtered) set; let the table paginate client-side since
  // the customer list is derived in-memory from the vendor's orders.
  const table = useReactTable({
    data: data ?? defaultData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { pagination },
    onPaginationChange: setPagination,
  });

  const showLoader = isLoading || isFetching;
  const { pageIndex, pageSize } = pagination;
  const totalRows = data?.length ?? 0;
  const rows = table.getRowModel().rows;
  const errorMessage =
    (error as { data?: { message?: string } })?.data?.message ??
    'Something went wrong';

  return (
    <div>
      <Table>
        <TableHeader className='bg-[hsla(0,0%,96%,1)] dark:bg-muted'>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className='hover:bg-transparent'>
              {headerGroup.headers.map((header, index) => {
                const isFirst = index === 0;
                const isLast = index === headerGroup.headers.length - 1;
                return (
                  <TableHead
                    key={header.id}
                    className={cn(
                      'h-[52px] whitespace-nowrap text-sm font-medium text-grey-black dark:text-foreground',
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

        <TableBody>
          {/* Loading: skeleton rows that mirror the real table layout */}
          {showLoader &&
            Array.from({ length: pageSize || 5 }).map((_, rowIndex) => (
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
                          isFirst ? 'size-9 rounded-full' : 'w-24'
                        )}
                      />
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}

          {!showLoader &&
            isSuccess &&
            rows.length > 0 &&
            rows.map((row) => (
              <TableRow
                key={row.id}
                onClick={() => onRowClick(row.original)}
                className='border-b cursor-pointer'
              >
                {row.getVisibleCells().map((cell, cellIndex) => {
                  const isFirst = cellIndex === 0;
                  const isLast = cellIndex === row.getVisibleCells().length - 1;
                  return (
                    <TableCell
                      key={cell.id}
                      onClick={
                        cell.column.id === 'actions'
                          ? (e) => e.stopPropagation()
                          : undefined
                      }
                      className={cn(
                        'py-4 whitespace-nowrap',
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

          {/* Empty state */}
          {!showLoader && isSuccess && totalRows === 0 && (
            <TableRow>
              <TableCell colSpan={columns.length} className='h-64 text-center'>
                <div className='flex flex-col items-center gap-4'>
                  <BoldBoxRemoveIcon />
                  <div className='flex flex-col items-center gap-2'>
                    <p className='text-lg font-medium text-muted-foreground'>
                      No customers yet.
                    </p>
                    <p className='text-sm text-muted-foreground'>
                      Customers will show up here once you receive orders.
                    </p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          )}

          {/* Error state */}
          {!showLoader && isError && (
            <TableRow>
              <TableCell colSpan={columns.length} className='h-64 text-center'>
                <div className='flex flex-col items-center gap-2'>
                  <p className='text-lg font-medium text-destructive'>
                    Error loading customers
                  </p>
                  <p className='text-sm text-muted-foreground'>{errorMessage}</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination — "Showing X - Y of {total}" to match the design */}
      {!showLoader && isSuccess && totalRows > 0 && (
        <div className='w-full flex items-center justify-end py-4 pr-6'>
          <div className='h-fit flex items-center gap-x-4'>
            <div className='text-sm text-muted-foreground text-center'>
              Showing {pageIndex * pageSize + 1} -{' '}
              {Math.min((pageIndex + 1) * pageSize, totalRows)} of {totalRows}
            </div>

            <Button
              className='w-6 h-6 text-sm rounded-full dark:border-gray-500'
              variant='outline'
              size='icon'
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className='w-4 h-4' />
            </Button>

            <Button
              className='w-6 h-6 text-sm rounded-full dark:border-gray-500'
              variant='outline'
              size='icon'
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className='w-4 h-4' />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

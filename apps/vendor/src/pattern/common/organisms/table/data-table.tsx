'use client';

// DataTable — the single, shared table component for the entire vendor app.
// Every page (Orders, Clothing, Fabrics, Accessories, Collections, Customers,
// Wallet) uses this component with its own column definitions and data.
//
// Features: skeleton loading, data rows, BoldBoxRemoveIcon empty state,
// error state, pagination, optional toolbar, optional row click handler.

import type { ReactNode } from 'react';
import { useMemo } from 'react';
import {
  type ColumnDef,
  type PaginationState,
  type OnChangeFn,
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
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { BoldBoxRemoveIcon } from '@/pattern/common/atoms/bold-box-remove-icon';
import { Pagination } from '@/pattern/common/organisms/table/pagination';

export interface DataTableProps<TData> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<TData, any>[];
  data: TData[];
  isLoading?: boolean;
  isFetching?: boolean;
  isSuccess?: boolean;
  isError?: boolean;
  error?: unknown;
  pagination: PaginationState;
  setPagination: OnChangeFn<PaginationState>;
  /** Total page count — required when manualPagination is true. */
  pageCount?: number;
  /** Total row count, shown in the "Showing X - Y of N" footer. */
  totalCount?: number;
  /** True when the parent paginates server-side; false paginates client-side. */
  manualPagination?: boolean;
  /** Rendered inside the card, above the table (e.g. a TableToolbar). */
  toolbar?: ReactNode;
  onRowClick?: (row: TData) => void;
  /** Main message shown in the empty state (default: "Nothing in here yet.") */
  emptyTitle?: string;
  /** Subtitle shown below the empty title */
  emptyMessage?: string;
  minWidth?: string;
}

// Generic TanStack-backed table used across the whole vendor app.
// Matches the design language of ClothingTable / CustomersTable with the
// BoldBoxRemoveIcon empty state, skeleton loader, error state, and Pagination.
export function DataTable<TData>({
  columns,
  data,
  isLoading = false,
  isFetching = false,
  isSuccess = true,
  isError = false,
  error,
  pagination,
  setPagination,
  pageCount,
  totalCount,
  manualPagination = false,
  toolbar,
  onRowClick,
  emptyTitle = 'Nothing in here yet.',
  emptyMessage,
  minWidth = '900px',
}: DataTableProps<TData>) {
  const defaultData = useMemo<TData[]>(() => [], []);

  const table = useReactTable({
    data: data ?? defaultData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { pagination },
    onPaginationChange: setPagination,
    manualPagination,
    ...(manualPagination ? { pageCount } : {}),
  });

  const errorMessage =
    (error as { data?: { message?: string } })?.data?.message ??
    'Something went wrong';

  const rows = table.getRowModel().rows;
  const showLoader = isLoading || isFetching;
  const skeletonRowCount = pagination.pageSize || 5;

  return (
    <>
      <Table style={{ minWidth }}>
        <TableHeader className='bg-[hsla(0,0%,96%,1)] dark:bg-[#4A4949]'>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className='hover:bg-transparent'>
              {headerGroup.headers.map((header, index) => {
                const isFirst = index === 0;
                const isLast = index === headerGroup.headers.length - 1;
                return (
                  <TableHead
                    key={header.id}
                    className={cn(
                      'h-[52px] pt-7 pb-4 whitespace-nowrap text-sm font-medium text-grey-black dark:text-white',
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
          {/* Loading: skeleton rows */}
          {showLoader &&
            Array.from({ length: skeletonRowCount }).map((_, rowIndex) => (
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
                          isFirst ? 'w-32' : isLast ? 'w-20' : 'w-24'
                        )}
                      />
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}

          {/* Data rows */}
          {!showLoader &&
            rows.length > 0 &&
            rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
                onClick={
                  onRowClick ? () => onRowClick(row.original) : undefined
                }
                className={cn(
                  'border-b',
                  onRowClick && 'cursor-pointer hover:bg-muted/50'
                )}
              >
                {row.getVisibleCells().map((cell, cellIndex) => {
                  const isFirst = cellIndex === 0;
                  const isLast =
                    cellIndex === row.getVisibleCells().length - 1;
                  return (
                    <TableCell
                      key={cell.id}
                      onClick={
                        cell.column.id === 'actions'
                          ? (e) => e.stopPropagation()
                          : undefined
                      }
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

          {/* Empty state */}
          {!showLoader && rows.length === 0 && !isError && (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className='h-64 text-center'
              >
                <div className='flex flex-col items-center gap-4'>
                  <BoldBoxRemoveIcon />
                  <div className='flex flex-col items-center gap-2'>
                    <p className='text-lg font-medium text-muted-foreground'>
                      {emptyTitle}
                    </p>
                    {emptyMessage && (
                      <p className='text-sm text-muted-foreground'>
                        {emptyMessage}
                      </p>
                    )}
                  </div>
                </div>
              </TableCell>
            </TableRow>
          )}

          {/* Error state */}
          {!showLoader && isError && (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className='h-64 text-center'
              >
                <div className='flex flex-col items-center gap-2'>
                  <p className='text-lg font-medium text-destructive'>
                    Error loading data
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    {errorMessage}
                  </p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      {!showLoader && rows.length > 0 && (
        <div className='py-4'>
          <Pagination table={table} />
        </div>
      )}
    </>
  );
}

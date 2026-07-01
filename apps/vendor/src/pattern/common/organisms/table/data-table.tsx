'use client';

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
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  emptyMessage?: string;
  minWidth?: string;
}

// Generic TanStack-backed table used by the detail-page tables. Encapsulates
// the loading / empty / error states and a design-matching footer so each table
// only supplies its column definitions and data.
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
  emptyMessage = 'Nothing here yet.',
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
  const { pageIndex, pageSize } = pagination;
  const total = manualPagination ? (totalCount ?? data.length) : data.length;
  const skeletonRowCount = pageSize || 5;

  return (
    <div className='overflow-hidden rounded-xl border bg-white custom-card-shadow'>
      {toolbar}

      <Table style={{ minWidth }}>
        <TableHeader className='bg-[#F9FAFB]'>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className='hover:bg-transparent'>
              {headerGroup.headers.map((header, index) => {
                const isFirst = index === 0;
                const isLast = index === headerGroup.headers.length - 1;
                return (
                  <TableHead
                    key={header.id}
                    className={cn(
                      'h-13 whitespace-nowrap text-sm font-medium text-grey-black',
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
            Array.from({ length: skeletonRowCount }).map((_, rowIndex) => (
              <TableRow
                key={`skeleton-${rowIndex}`}
                className='border-t hover:bg-transparent'
              >
                {columns.map((_, cellIndex) => {
                  const isFirst = cellIndex === 0;
                  const isLast = cellIndex === columns.length - 1;
                  return (
                    <TableCell
                      key={cellIndex}
                      className={cn('py-4', isFirst && 'pl-6', isLast && 'pr-6')}
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

          {!showLoader &&
            isSuccess &&
            rows.length > 0 &&
            rows.map((row) => (
              <TableRow
                key={row.id}
                onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                className={cn('border-t', onRowClick && 'cursor-pointer')}
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
                        'py-4 align-middle text-sm',
                        isFirst && 'pl-6',
                        isLast && 'pr-6'
                      )}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}

          {!showLoader && isSuccess && data.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className='h-48 text-center text-sm text-muted-foreground'
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}

          {!showLoader && isError && (
            <TableRow>
              <TableCell colSpan={columns.length} className='h-48 text-center'>
                <p className='text-base font-medium text-destructive'>
                  Error loading data
                </p>
                <p className='text-sm text-muted-foreground'>{errorMessage}</p>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {!showLoader && isSuccess && rows.length > 0 && (
        <div className='w-full flex items-center justify-end py-4 pr-6'>
          <div className='h-fit flex items-center gap-x-4'>
            <div className='text-sm text-muted-foreground text-center'>
              Showing {pageIndex * pageSize + 1} -{' '}
              {Math.min((pageIndex + 1) * pageSize, total)} of {total}
            </div>
            <Button
              className='w-6 h-6 text-sm rounded-full'
              variant='outline'
              size='icon'
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className='w-4 h-4' />
            </Button>
            <Button
              className='w-6 h-6 text-sm rounded-full'
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
}

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
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { readApiError } from '@/redux/services/types';
import { Pagination } from './pagination';

export interface DataTableProps<TData> {
  columns: ColumnDef<TData, any>[];
  data: TData[];
  isLoading?: boolean;
  isFetching?: boolean;
  isSuccess?: boolean;
  isError?: boolean;
  error?: unknown;
  pagination: PaginationState;
  setPagination: OnChangeFn<PaginationState>;
  pageCount: number;
  /**
   * Rows across every page. Without it the footer can only count the rows it
   * was handed, so a paginated table reports its page size as the total.
   */
  totalRows?: number;
  /** Rendered inside the card, above the table (e.g. a TableToolbar). */
  toolbar?: ReactNode;
  onRowClick?: (row: TData) => void;
  emptyMessage?: string;
  loadingMessage?: string;
  minWidth?: string;
}

// Generic TanStack-backed table used by all detail-page tables. Encapsulates
// the loading / empty / error states and shared pagination so each table only
// supplies its column definitions and data.
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
  totalRows,
  toolbar,
  onRowClick,
  emptyMessage = 'Nothing here yet.',
  minWidth = '900px',
}: DataTableProps<TData>) {
  const defaultData = useMemo<TData[]>(() => [], []);

  const table = useReactTable({
    data: data ?? defaultData,
    columns,
    pageCount,
    rowCount: totalRows ?? data?.length,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { pagination },
    onPaginationChange: setPagination,
    manualPagination: true,
  });

  // readApiError also handles a bare string and Nest's array-of-messages,
  // which the hand-rolled read here missed.
  const errorMessage = readApiError(error);

  const rows = table.getRowModel().rows;
  // Skeletons are for the FIRST load only. Tying them to isFetching as well
  // replaced the whole table on every refetch — each debounced keystroke in
  // search, every filter change, every page turn — and took the pager with it,
  // so clicking "next" made the control you were using disappear until the
  // response landed. A refetch now dims the rows in place and leaves the pager
  // reachable.
  const showSkeleton = isLoading;
  const isRefetching = isFetching && !isLoading;
  const hasRows = rows.length > 0;
  const skeletonRowCount = pagination.pageSize || 5;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white dark:bg-card custom-card-shadow">
      {toolbar}

      <Table
        style={{ minWidth }}
        className={cn(
          'transition-opacity',
          isRefetching && 'pointer-events-none opacity-60'
        )}
      >
        <TableHeader className="bg-[#F9FAFB] dark:bg-muted">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header, index) => {
                const isFirst = index === 0;
                const isLast = index === headerGroup.headers.length - 1;
                return (
                  <TableHead
                    key={header.id}
                    className={cn(
                      'h-[52px] whitespace-nowrap text-xs font-medium text-gray-500 dark:text-gray-400',
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
          {showSkeleton &&
            Array.from({ length: skeletonRowCount }).map((_, rowIndex) => (
              <TableRow
                key={`skeleton-${rowIndex}`}
                className="border-t border-border hover:bg-transparent"
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
                          isFirst ? 'w-32' : isLast ? 'w-8' : 'w-24'
                        )}
                      />
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}

          {!showSkeleton &&
            hasRows &&
            rows.map((row) => (
              <TableRow
                key={row.id}
                onClick={
                  onRowClick ? () => onRowClick(row.original) : undefined
                }
                className={cn(
                  'border-t border-border',
                  // Hover feedback so a clickable row reads as clickable —
                  // cursor-pointer alone isn't discoverable enough.
                  onRowClick &&
                    'cursor-pointer transition-colors hover:bg-[#F9FAFB] dark:hover:bg-muted/80'
                )}
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
                        'py-4 align-top text-sm',
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

          {!showSkeleton && !isError && isSuccess && !hasRows && (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-48 text-center text-sm text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}

          {!showSkeleton && isError && (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-48 text-center">
                <p className="text-base font-medium text-destructive">
                  Error loading data
                </p>
                <p className="text-sm text-muted-foreground">{errorMessage}</p>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {!showSkeleton && hasRows && <Pagination table={table} />}
    </div>
  );
}

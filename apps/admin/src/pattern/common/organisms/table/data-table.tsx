'use client';

import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { Loader2 } from 'lucide-react';
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
import { Pagination } from './pagination';

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
  pageCount: number;
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
  toolbar,
  onRowClick,
  emptyMessage = 'Nothing here yet.',
  loadingMessage = 'Loading...',
  minWidth = '900px',
}: DataTableProps<TData>) {
  const defaultData = useMemo<TData[]>(() => [], []);

  const table = useReactTable({
    data: data ?? defaultData,
    columns,
    pageCount,
    rowCount: data?.length,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { pagination },
    onPaginationChange: setPagination,
    manualPagination: true,
  });

  const errorMessage =
    (error as { data?: { message?: string } })?.data?.message ??
    'Something went wrong';

  const rows = table.getRowModel().rows;
  const showLoader = isLoading || isFetching;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white custom-card-shadow">
      {toolbar}

      {showLoader ? (
        <div className="flex h-64 items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">{loadingMessage}</p>
          </div>
        </div>
      ) : (
        <>
          <Table style={{ minWidth }}>
            <TableHeader className="bg-[#F9FAFB]">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header, index) => {
                    const isFirst = index === 0;
                    const isLast = index === headerGroup.headers.length - 1;
                    return (
                      <TableHead
                        key={header.id}
                        className={cn(
                          'h-[52px] whitespace-nowrap text-xs font-medium text-gray-500',
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
              {isSuccess &&
                rows.length > 0 &&
                rows.map((row) => (
                  <TableRow
                    key={row.id}
                    onClick={
                      onRowClick
                        ? () => onRowClick(row.original)
                        : undefined
                    }
                    className={cn(
                      'border-t border-border',
                      onRowClick && 'cursor-pointer'
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

              {isSuccess && data.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-48 text-center text-sm text-muted-foreground"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              )}

              {isError && (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-48 text-center">
                    <p className="text-base font-medium text-destructive">
                      Error loading data
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {errorMessage}
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {isSuccess && rows.length > 0 && <Pagination table={table} />}
        </>
      )}
    </div>
  );
}

import React from 'react';
import { Table } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/index';

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  className?: string;
}

export function Pagination<TData>({
  table,
  className,
}: DataTablePaginationProps<TData>) {
  const { pageIndex, pageSize } = table.getState().pagination;
  const totalRows = table.getRowCount();

  return (
    <div
      className={cn(
        'w-full flex items-center justify-end py-4 pr-6',
        className
      )}
    >
      <div className="h-fit flex items-center gap-x-4">
        <div className="text-sm text-muted-foreground text-center">
          {/* "of" is the row total, not the page count — the latter read as
              "Showing 1 - 5 of 1". */}
          Showing {totalRows === 0 ? 0 : pageIndex * pageSize + 1} -{' '}
          {Math.min((pageIndex + 1) * pageSize, totalRows)} of {totalRows}
        </div>

        {/* Previous Button */}
        <Button
          className="w-6 h-6 text-sm rounded-full"
          variant="outline"
          size="icon"
          onClick={() => {
            table.previousPage();
          }}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {/* Next button */}
        <Button
          className="w-6 h-6 text-sm rounded-full"
          variant="outline"
          size="icon"
          onClick={() => {
            table.nextPage();
          }}
          disabled={!table.getCanNextPage()}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

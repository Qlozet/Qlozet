'use client';

import type { ReactNode } from 'react';
import { Calendar, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ExcelExportButton } from './excel-export-button';
import { cn } from '@/lib/utils';

interface TableToolbarProps {
  title: string;
  search?: string;
  onSearchChange?: (value: string) => void;
  onFilterDate?: () => void;
  onExport?: () => void;
  /** Label for the filter button (defaults to "Filter By Date"). */
  filterLabel?: string;
  /** Icon for the filter button; pass null to hide it (defaults to a Calendar). */
  filterIcon?: ReactNode;
  /**
   * Custom control rendered in place of the default filter button — e.g. a
   * Popover-wrapped trigger. When provided, `filterLabel`/`filterIcon`/
   * `onFilterDate` are ignored.
   */
  filterControl?: ReactNode;
  /** Optional extra control rendered at the far right (e.g. a status filter). */
  rightExtra?: ReactNode;
  className?: string;
}

// Shared "Filter By Date · Search · Export" toolbar used by the detail-page
// tables (Recent Transactions, Tickets).
export const TableToolbar = ({
  title,
  search,
  onSearchChange,
  onFilterDate,
  onExport,
  filterLabel = 'Filter By Date',
  filterIcon = <Calendar className='size-4' />,
  filterControl,
  rightExtra,
  className,
}: TableToolbarProps) => {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between',
        className
      )}
    >
      <h2 className='text-lg font-semibold text-[hsla(210,9%,31%,1)] dark:text-white'>
        {title}
      </h2>

      <div className='flex flex-wrap items-center gap-3'>
        {filterControl ?? (
          <Button
            type='button'
            variant='outline'
            onClick={onFilterDate}
            className='h-10 gap-2 text-sm text-gray-600'
          >
            {filterIcon}
            {filterLabel}
          </Button>
        )}

        <div className='relative'>
          <Search className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400' />
          <Input
            value={search ?? ''}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder='Search'
            className='h-10 w-full sm:w-[240px] rounded-lg pl-9'
          />
        </div>

        <ExcelExportButton onClick={onExport} />

        {rightExtra}
      </div>
    </div>
  );
};

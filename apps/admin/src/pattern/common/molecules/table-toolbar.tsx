'use client';

import type { ReactNode } from 'react';
import { Calendar, Search, Sheet, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
   * Replaces the default filter button entirely (e.g. with a status dropdown).
   * When set, `filterLabel` / `filterIcon` / `onFilterDate` are ignored.
   */
  filterControl?: ReactNode;
  /** Optional extra control rendered at the far right (e.g. a status filter). */
  rightExtra?: ReactNode;
  /** Hide the filter control entirely (nothing to filter on). */
  showFilter?: boolean;
  /** Hide the export button entirely (nothing to export). */
  showExport?: boolean;
  /** Hide the search field entirely (nothing searchable). */
  showSearch?: boolean;
  className?: string;
}

// Shared "Filter By Date · Search · Export" toolbar used by every detail-page
// table (Top Products, Activity Log, Complaints).
export const TableToolbar = ({
  title,
  search,
  onSearchChange,
  onFilterDate,
  onExport,
  filterLabel = 'Filter By Date',
  filterIcon = <Calendar className="size-4" />,
  filterControl,
  rightExtra,
  showFilter = true,
  showExport = true,
  showSearch = true,
  className,
}: TableToolbarProps) => {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between',
        className
      )}
    >
      <h2 className="text-lg font-semibold text-[hsla(210,9%,31%,1)] dark:text-white">
        {title}
      </h2>

      {/* On mobile the controls collapse to one row: icon-only filter, a
          flexible search field, icon-only export (matching the vendor app). */}
      <div className="flex w-full items-stretch gap-2 sm:gap-3 md:w-auto">
        {showFilter &&
          (filterControl ?? (
            <Button
              type="button"
              variant="outline"
              onClick={onFilterDate}
              aria-label={filterLabel}
              className="h-10 w-10 shrink-0 gap-2 px-0 text-sm text-gray-600 sm:w-auto sm:px-4"
            >
              <SlidersHorizontal className="size-4 sm:hidden" />
              <span className="hidden items-center gap-2 sm:flex">
                {filterIcon}
                {filterLabel}
              </span>
            </Button>
          ))}

        {showSearch && (
          <div className="relative flex-1 sm:flex-none">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={search ?? ''}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Search"
              className="h-10 w-full rounded-lg pl-9 sm:w-60"
            />
          </div>
        )}

        {showExport && (
          <Button
            type="button"
            onClick={onExport}
            aria-label="Export"
            className="h-10 w-10 shrink-0 gap-2 px-0 text-sm sm:w-auto sm:px-4"
          >
            <Sheet className="size-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        )}

        {rightExtra}
      </div>
    </div>
  );
};

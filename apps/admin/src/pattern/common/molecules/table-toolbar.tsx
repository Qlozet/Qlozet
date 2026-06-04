'use client';

import type { ReactNode } from 'react';
import { Calendar, Search, Sheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface TableToolbarProps {
  title: string;
  search?: string;
  onSearchChange?: (value: string) => void;
  onFilterDate?: () => void;
  onExport?: () => void;
  /** Optional extra control rendered at the far right (e.g. a status filter). */
  rightExtra?: ReactNode;
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
      <h2 className="text-lg font-semibold text-[hsla(210,9%,31%,1)] dark:text-white">
        {title}
      </h2>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onFilterDate}
          className="h-10 gap-2 text-sm text-gray-600"
        >
          <Calendar className="size-4" />
          Filter By Date
        </Button>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={search ?? ''}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search"
            className="h-10 w-[240px] rounded-lg pl-9"
          />
        </div>

        <Button
          type="button"
          onClick={onExport}
          className="h-10 gap-2 text-sm"
        >
          <Sheet className="size-4" />
          Export
        </Button>

        {rightExtra}
      </div>
    </div>
  );
};

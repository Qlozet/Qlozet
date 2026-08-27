'use client';

import type { PaginationState, OnChangeFn } from '@tanstack/react-table';
import type { Business } from '@/redux/services/businesses/businesses.api-slice';
import {
  DateRangeFilter,
  type DateRange,
} from '@/pattern/common/molecules/date-range-filter';
import { VendorSearchInput } from '../molecules/vendor-search-input';
import { VendorStatusFilter } from '../molecules/vendor-status-filter';
import { VendorsTable } from '../organisms/vendors-table';
import type { VendorSortColumn } from '../molecules/vendors-table-columns';

interface VendorsTableTemplateProps {
  vendors: Business[];
  isLoading: boolean;
  isFetching: boolean;
  isSuccess: boolean;
  isError: boolean;
  error?: unknown;
  status: string;
  onStatusChange: (status: string) => void;
  pagination: PaginationState;
  setPagination: OnChangeFn<PaginationState>;
  pageCount: number;
  totalRows?: number;
  search: string;
  onSearchChange: (search: string) => void;
  sort?: VendorSortColumn;
  order?: 'asc' | 'desc';
  onToggleSort: (column: VendorSortColumn) => void;
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

export const VendorsTableTemplate = ({
  vendors,
  isLoading,
  isFetching,
  isSuccess,
  isError,
  error,
  status,
  onStatusChange,
  pagination,
  setPagination,
  pageCount,
  totalRows,
  search,
  onSearchChange,
  sort,
  order,
  onToggleSort,
  dateRange,
  onDateRangeChange,
}: VendorsTableTemplateProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[hsla(210,9%,31%,1)] dark:text-white">
          Vendors
        </h2>
        <div className="flex items-center gap-3">
          <VendorSearchInput value={search} onChange={onSearchChange} />
          <DateRangeFilter value={dateRange} onChange={onDateRangeChange} />
          <VendorStatusFilter value={status} onChange={onStatusChange} />
        </div>
      </div>

      <VendorsTable
        data={vendors}
        isLoading={isLoading}
        isFetching={isFetching}
        isSuccess={isSuccess}
        isError={isError}
        error={error}
        pagination={pagination}
        setPagination={setPagination}
        pageCount={pageCount}
        totalRows={totalRows}
        sort={sort}
        order={order}
        onToggleSort={onToggleSort}
      />
    </div>
  );
};

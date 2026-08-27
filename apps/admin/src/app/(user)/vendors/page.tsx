'use client';

import { useCallback, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import type { PaginationState } from '@tanstack/react-table';
import NiceModal from '@ebay/nice-modal-react';
import { WorkInProgressModal } from '@/pattern/common/organisms/work-in-progress-modal';
import { VendorStatsCards } from '@/pattern/vendors/templates/vendor-stats-cards';
import { VendorsTableTemplate } from '@/pattern/vendors/templates/vendors-table-template';
import type { VendorSortColumn } from '@/pattern/vendors/molecules/vendors-table-columns';
import {
  EMPTY_DATE_RANGE,
  type DateRange,
} from '@/pattern/common/molecules/date-range-filter';
import {
  useGetBusinessesQuery,
  type VendorSummary,
} from '@/redux/services/businesses/businesses.api-slice';

const PAGE_SIZE = 8;

const VendorsPage = () => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  // undefined = the endpoint's default order (oldest first).
  const [sortState, setSortState] = useState<{
    column?: VendorSortColumn;
    order?: 'asc' | 'desc';
  }>({});
  const { column: sort, order } = sortState;
  const [dateRange, setDateRange] = useState<DateRange>(EMPTY_DATE_RANGE);

  const { data, isLoading, isFetching, isSuccess, isError, error } =
    useGetBusinessesQuery({
      page: pagination.pageIndex + 1,
      size: pagination.pageSize,
      status: status || undefined,
      search: search || undefined,
      // Every one of these is applied by the endpoint's aggregation, not to the
      // page already on screen: products, orders and revenue are computed per
      // row, and a client-side sort or filter would only ever cover one page.
      // Both or neither: `order` alone would silently reverse the default sort.
      sort,
      order: sort ? order : undefined,
      startDate: dateRange.start || undefined,
      // End of the chosen day, so a single-day range covers that whole day.
      endDate: dateRange.end ? `${dateRange.end}T23:59:59.999Z` : undefined,
    });

  const paginated = data?.data as any;
  const vendors = useMemo(() => paginated?.data ?? [], [paginated]);
  const totalCount =
    paginated?.total_items ??
    paginated?.totalCount ??
    paginated?.total ??
    vendors.length;
  const pageCountFromApi = paginated?.total_pages ?? paginated?.totalPages;
  const pageCount =
    pageCountFromApi ||
    Math.max(Math.ceil(totalCount / pagination.pageSize), 1);

  const summary = paginated?.summary as VendorSummary | undefined;

  // Any change to what is being listed sends the reader back to page 1 —
  // otherwise a filter that yields two pages can leave you stranded on page 4
  // looking at an empty table.
  const toFirstPage = () =>
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));

  const handleStatusChange = (next: string) => {
    setStatus(next);
    toFirstPage();
  };

  const handleSearchChange = (next: string) => {
    setSearch(next);
    toFirstPage();
  };

  // desc -> asc -> off, so a third click restores the endpoint's default order
  // rather than trapping the table in a sort. A different column starts at
  // desc, which is what "show me the biggest" means for every sortable column
  // here.
  const toggleSort = useCallback((column: VendorSortColumn) => {
    setSortState((current) => {
      if (current.column !== column) return { column, order: 'desc' };
      if (current.order === 'desc') return { column, order: 'asc' };
      return {};
    });
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, []);

  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
    toFirstPage();
  };

  return (
    <div className="w-full min-h-screen h-fit space-y-6 pb-10">
      {/* No Add Vendor action: vendors self-register through
          POST /auth/register/vendor, which sets a password and sends an email
          verification link. There is no admin-side create endpoint, so this
          console can only review and approve businesses, not create them. */}

      {/* Vendor metrics */}
      <VendorStatsCards
        summary={summary}
        totalFromList={totalCount}
        isLoading={isLoading}
      />

      {/* Vendors table */}
      <VendorsTableTemplate
        vendors={vendors}
        isLoading={isLoading}
        isFetching={isFetching}
        isSuccess={isSuccess}
        isError={isError}
        error={error}
        status={status}
        onStatusChange={handleStatusChange}
        search={search}
        onSearchChange={handleSearchChange}
        sort={sort}
        order={order}
        onToggleSort={toggleSort}
        dateRange={dateRange}
        onDateRangeChange={handleDateRangeChange}
        pagination={pagination}
        setPagination={setPagination}
        pageCount={pageCount}
        totalRows={totalCount}
      />
    </div>
  );
};

export default VendorsPage;

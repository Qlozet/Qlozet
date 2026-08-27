'use client';

import { useEffect, useMemo, useState } from 'react';
import type { PaginationState } from '@tanstack/react-table';
import { CustomerStatsCards } from '@/pattern/customers/templates/customer-stats-cards';
import { CustomersTableTemplate } from '@/pattern/customers/templates/customers-table-template';
import {
  useGetCustomersQuery,
  type CustomerSummary,
} from '@/redux/services/customers/customers.api-slice';
import { readPageCount, readTotalItems } from '@/redux/services/types';
import {
  EMPTY_DATE_RANGE,
  type DateRange,
} from '@/pattern/common/molecules/date-range-filter';

const PAGE_SIZE = 5;

export default function CustomersPage() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [dateRange, setDateRange] = useState<DateRange>(EMPTY_DATE_RANGE);

  // Debounce the search input so we don't refetch on every keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, isFetching, isSuccess, isError, error } =
    useGetCustomersQuery({
      page: pagination.pageIndex + 1,
      size: pagination.pageSize,
      search: debouncedSearch || undefined,
      // Sent to the server: filtering client-side only ever filtered the page
      // on screen, so a range matching rows on page 3 showed an empty table.
      startDate: dateRange.start || undefined,
      // End of the chosen day, so a single-day range includes that whole day
      // rather than only midnight.
      endDate: dateRange.end ? `${dateRange.end}T23:59:59.999Z` : undefined,
    });

  const paginated = data?.data;
  const customers = useMemo(() => paginated?.data ?? [], [paginated]);
  const summary = (paginated as { summary?: CustomerSummary } | undefined)
    ?.summary;
  const totalCount = readTotalItems(paginated) ?? customers.length;
  const pageCount = readPageCount(paginated, pagination.pageSize);

  // Any change to what is being listed returns the reader to page 1.
  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  return (
    <div className="w-full min-h-screen h-fit space-y-6 pb-10">
      {/* Customer metrics */}
      <CustomerStatsCards
        summary={summary}
        totalFromList={totalCount}
        isLoading={isLoading}
      />

      {/* Customers table */}
      <CustomersTableTemplate
        customers={customers}
        isLoading={isLoading}
        isFetching={isFetching}
        isSuccess={isSuccess}
        isError={isError}
        error={error}
        search={search}
        onSearchChange={setSearch}
        pagination={pagination}
        setPagination={setPagination}
        pageCount={pageCount}
        totalRows={totalCount}
        dateRange={dateRange}
        onDateRangeChange={handleDateRangeChange}
      />
    </div>
  );
}

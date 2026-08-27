'use client';

import { useCallback } from 'react';
import type { PaginationState, OnChangeFn } from '@tanstack/react-table';
import { toast } from 'sonner';
import { TableToolbar } from '@/pattern/common/molecules/table-toolbar';
import {
  DateRangeFilter,
  type DateRange,
} from '@/pattern/common/molecules/date-range-filter';
import { downloadCsv, toCsv } from '@/lib/csv';
import {
  formatJoinedDate,
  getCustomerEmail,
  getCustomerName,
  getCustomerPhone,
  getCustomerTotalOrders,
} from '@/lib/customers';
import type { Customer } from '@/redux/services/customers/customers.api-slice';
import { CustomersTable } from '../organisms/customers-table';

interface CustomersTableTemplateProps {
  customers: Customer[];
  isLoading: boolean;
  isFetching: boolean;
  isSuccess: boolean;
  isError: boolean;
  error?: unknown;
  search: string;
  onSearchChange: (value: string) => void;
  pagination: PaginationState;
  setPagination: OnChangeFn<PaginationState>;
  pageCount: number;
  /** Rows across every page, so the footer can report a real total. */
  totalRows?: number;
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

const CSV_HEADERS = ['Name', 'Email', 'Phone', 'Total orders', 'Date joined'];

const toCsvRow = (customer: Customer) => [
  getCustomerName(customer),
  getCustomerEmail(customer),
  getCustomerPhone(customer),
  String(getCustomerTotalOrders(customer) ?? 0),
  formatJoinedDate(customer.createdAt),
];

export const CustomersTableTemplate = ({
  customers,
  isLoading,
  isFetching,
  isSuccess,
  isError,
  error,
  search,
  onSearchChange,
  pagination,
  setPagination,
  pageCount,
  totalRows,
  dateRange,
  onDateRangeChange,
}: CustomersTableTemplateProps) => {
  // The date range goes to the server. It used to filter the rows already on
  // screen, which on a paginated list only ever filtered ONE page — so a range
  // matching customers on page 3 showed nothing while claiming to have filtered
  // everything. GET /admin/customer accepts startDate/endDate.
  const handleExport = useCallback(() => {
    if (customers.length === 0) {
      toast.info('There are no customers to export.');
      return;
    }
    // This page only. The endpoint has no "all rows" mode, and fetching every
    // page to build the file would hammer it.
    downloadCsv('customers.csv', toCsv(CSV_HEADERS, customers.map(toCsvRow)));
  }, [customers]);

  return (
    <CustomersTable
      data={customers}
      isLoading={isLoading}
      isFetching={isFetching}
      isSuccess={isSuccess}
      isError={isError}
      error={error}
      pagination={pagination}
      setPagination={setPagination}
      pageCount={pageCount}
      totalRows={totalRows}
      toolbar={
        <TableToolbar
          title="Customers"
          search={search}
          onSearchChange={onSearchChange}
          onExport={handleExport}
          filterControl={
            <DateRangeFilter value={dateRange} onChange={onDateRangeChange} />
          }
        />
      }
    />
  );
};

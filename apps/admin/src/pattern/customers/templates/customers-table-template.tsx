'use client';

import { useCallback, useMemo, useState } from 'react';
import type { PaginationState, OnChangeFn } from '@tanstack/react-table';
import { toast } from 'sonner';
import { TableToolbar } from '@/pattern/common/molecules/table-toolbar';
import {
  DateRangeFilter,
  EMPTY_DATE_RANGE,
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
}: CustomersTableTemplateProps) => {
  const [dateRange, setDateRange] = useState<DateRange>(EMPTY_DATE_RANGE);

  // GET /admin/customer takes no date params, so the join-date filter is
  // applied to the rows already on screen rather than sent to the backend.
  const visible = useMemo(() => {
    if (!dateRange.start && !dateRange.end) return customers;
    return customers.filter((customer) => {
      const joined = String(customer.createdAt ?? '').slice(0, 10);
      if (!joined) return false;
      if (dateRange.start && joined < dateRange.start) return false;
      if (dateRange.end && joined > dateRange.end) return false;
      return true;
    });
  }, [customers, dateRange]);

  const handleExport = useCallback(() => {
    if (visible.length === 0) {
      toast.info('There are no customers to export.');
      return;
    }
    downloadCsv('customers.csv', toCsv(CSV_HEADERS, visible.map(toCsvRow)));
  }, [visible]);

  return (
    <CustomersTable
      data={visible}
      isLoading={isLoading}
      isFetching={isFetching}
      isSuccess={isSuccess}
      isError={isError}
      error={error}
      pagination={pagination}
      setPagination={setPagination}
      pageCount={pageCount}
      toolbar={
        <TableToolbar
          title="Customers"
          search={search}
          onSearchChange={onSearchChange}
          onExport={handleExport}
          filterControl={
            <DateRangeFilter value={dateRange} onChange={setDateRange} />
          }
        />
      }
    />
  );
};

'use client';

import { useEffect, useMemo, useState } from 'react';
import type { PaginationState } from '@tanstack/react-table';
import { CustomerStatsCards } from '@/pattern/customers/templates/customer-stats-cards';
import { CustomersTableTemplate } from '@/pattern/customers/templates/customers-table-template';
import { useGetCustomersQuery } from '@/redux/services/customers/customers.api-slice';

const PAGE_SIZE = 5;

export default function CustomersPage() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

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
    });

  const paginated = data?.data;
  const customers = useMemo(() => paginated?.data ?? [], [paginated]);
  const totalCount =
    paginated?.totalCount ?? paginated?.total ?? customers.length;
  const pageCount = Math.max(Math.ceil(totalCount / pagination.pageSize), 1);

  return (
    <div className="w-full min-h-screen h-fit space-y-6 pb-10">
      {/* Customer metrics */}
      <CustomerStatsCards totalFromList={totalCount} />

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
      />
    </div>
  );
}

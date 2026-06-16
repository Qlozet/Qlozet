'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { PaginationState, OnChangeFn } from '@tanstack/react-table';
import { APP_ROUTES } from '@/lib/routes';
import { DataTable } from '@/pattern/common/organisms/table/data-table';
import type { Customer } from '@/redux/services/customers/customers.api-slice';
import { createCustomersTableColumns } from '../molecules/customers-table-columns';

interface CustomersTableProps {
  data: Customer[];
  isLoading: boolean;
  isFetching: boolean;
  isSuccess: boolean;
  isError: boolean;
  error?: unknown;
  pagination: PaginationState;
  setPagination: OnChangeFn<PaginationState>;
  pageCount: number;
  toolbar?: React.ReactNode;
}

export const CustomersTable = ({
  data,
  isLoading,
  isFetching,
  isSuccess,
  isError,
  error,
  pagination,
  setPagination,
  pageCount,
  toolbar,
}: CustomersTableProps) => {
  const router = useRouter();

  const columns = useMemo(
    () =>
      createCustomersTableColumns({
        onViewDetails: (id) => router.push(`${APP_ROUTES.customers}/${id}`),
      }),
    [router]
  );

  return (
    <DataTable<Customer>
      columns={columns}
      data={data}
      isLoading={isLoading}
      isFetching={isFetching}
      isSuccess={isSuccess}
      isError={isError}
      error={error}
      pagination={pagination}
      setPagination={setPagination}
      pageCount={pageCount}
      toolbar={toolbar}
      onRowClick={(customer) =>
        router.push(`${APP_ROUTES.customers}/${customer._id}`)
      }
      emptyMessage="No customers found."
      loadingMessage="Loading customers..."
    />
  );
};

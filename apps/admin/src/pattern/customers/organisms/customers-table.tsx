'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { PaginationState, OnChangeFn } from '@tanstack/react-table';
import { APP_ROUTES } from '@/lib/routes';
import { DataTable } from '@/pattern/common/organisms/table/data-table';
import {
  useDeleteCustomerMutation,
  useSetCustomerStatusMutation,
  type Customer,
} from '@/redux/services/customers/customers.api-slice';
import { getCustomerName } from '@/lib/customers';
import { readApiError } from '@/redux/services/types';
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
  /** Rows across every page, so the footer can report a real total. */
  totalRows?: number;
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
  totalRows,
  toolbar,
}: CustomersTableProps) => {
  const router = useRouter();

  const [setStatus, { isLoading: isSettingStatus }] =
    useSetCustomerStatusMutation();
  const [remove, { isLoading: isDeleting }] = useDeleteCustomerMutation();

  const columns = useMemo(
    () =>
      createCustomersTableColumns({
        onViewDetails: (id) => router.push(`${APP_ROUTES.customers}/${id}`),
        onCopyEmail: async (email) => {
          try {
            await navigator.clipboard.writeText(email);
            toast.success('Email copied');
          } catch {
            // Denied permission, or a non-secure origin.
            toast.error("Couldn't copy — copy it from the row instead.");
          }
        },
        // The orders list filters by buyer server-side; ?customerId= is read
        // back off the URL there.
        onViewOrders: (id) =>
          router.push(`${APP_ROUTES.orders}?customerId=${id}`),
        onSetStatus: async (customer, status) => {
          const name = getCustomerName(customer);
          try {
            await setStatus({ customerId: customer._id, status }).unwrap();
            toast.success(
              status === 'active' ? `${name} reactivated` : `${name} suspended`
            );
          } catch (error) {
            toast.error(readApiError(error));
          }
        },
        onDelete: async (customer) => {
          // Irreversible, so it is confirmed rather than one click away inside
          // a menu.
          const name = getCustomerName(customer);
          if (
            typeof window !== 'undefined' &&
            !window.confirm(
              `Permanently delete ${name}? This cannot be undone.`
            )
          ) {
            return;
          }
          try {
            await remove(customer._id).unwrap();
            toast.success(`${name} deleted`);
          } catch (error) {
            // A 409 explains that the customer has orders and says to suspend
            // instead — surface that rather than a generic failure.
            toast.error(readApiError(error));
          }
        },
        isUpdating: isSettingStatus || isDeleting,
      }),
    [router, setStatus, remove, isSettingStatus, isDeleting]
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
      totalRows={totalRows}
      toolbar={toolbar}
      onRowClick={(customer) =>
        router.push(`${APP_ROUTES.customers}/${customer._id}`)
      }
      emptyMessage="No customers found."
      loadingMessage="Loading customers..."
    />
  );
};

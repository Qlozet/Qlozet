'use client';

import NiceModal from '@ebay/nice-modal-react';
import type { PaginationState, OnChangeFn } from '@tanstack/react-table';
import { WorkInProgressModal } from '@/pattern/common/organisms/work-in-progress-modal';
import { TableToolbar } from '@/pattern/common/molecules/table-toolbar';
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
  const showWip = () => NiceModal.show(WorkInProgressModal);

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
      toolbar={
        <TableToolbar
          title="Customers"
          search={search}
          onSearchChange={onSearchChange}
          onFilterDate={showWip}
          onExport={showWip}
        />
      }
    />
  );
};

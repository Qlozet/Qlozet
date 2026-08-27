'use client';

import { useMemo } from 'react';
import type { PaginationState, OnChangeFn } from '@tanstack/react-table';
import { DataTable } from '@/pattern/common/organisms/table/data-table';
import type { PlatformAdmin } from '@/redux/services/users/users.api-slice';
import { createAdminsTableColumns } from '../molecules/admins-table-columns';

interface AdminsTableProps {
  data: PlatformAdmin[];
  isLoading: boolean;
  isFetching: boolean;
  isSuccess: boolean;
  isError: boolean;
  error?: unknown;
  pagination: PaginationState;
  setPagination: OnChangeFn<PaginationState>;
  pageCount: number;
  totalRows?: number;
  currentUserId?: string;
  onEdit: (admin: PlatformAdmin) => void;
  onToggleStatus: (admin: PlatformAdmin) => void;
}

export const AdminsTable = ({
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
  currentUserId,
  onEdit,
  onToggleStatus,
}: AdminsTableProps) => {
  const columns = useMemo(
    () => createAdminsTableColumns({ onEdit, onToggleStatus, currentUserId }),
    [onEdit, onToggleStatus, currentUserId]
  );

  return (
    <DataTable<PlatformAdmin>
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
      emptyMessage="No administrators found."
      loadingMessage="Loading administrators..."
    />
  );
};

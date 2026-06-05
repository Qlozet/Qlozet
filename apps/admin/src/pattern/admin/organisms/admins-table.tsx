'use client';

import { useMemo } from 'react';
import NiceModal from '@ebay/nice-modal-react';
import type { PaginationState, OnChangeFn } from '@tanstack/react-table';
import { DataTable } from '@/pattern/common/organisms/table/data-table';
import { WorkInProgressModal } from '@/pattern/common/organisms/work-in-progress-modal';
import type { TeamMember } from '@/redux/services/users/users.api-slice';
import { createAdminsTableColumns } from '../molecules/admins-table-columns';

interface AdminsTableProps {
  data: TeamMember[];
  isLoading: boolean;
  isFetching: boolean;
  isSuccess: boolean;
  isError: boolean;
  error?: unknown;
  pagination: PaginationState;
  setPagination: OnChangeFn<PaginationState>;
  pageCount: number;
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
}: AdminsTableProps) => {
  // The backend currently exposes only list + invite for team members; editing
  // and deactivating an admin aren't available yet, so both actions surface the
  // shared "Work in Progress" modal (the app's convention for un-built actions).
  const columns = useMemo(
    () =>
      createAdminsTableColumns({
        onEdit: () => NiceModal.show(WorkInProgressModal),
        onDeactivate: () => NiceModal.show(WorkInProgressModal),
      }),
    []
  );

  return (
    <DataTable<TeamMember>
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
      emptyMessage='No administrators found.'
      loadingMessage='Loading administrators...'
    />
  );
};

'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import type { PaginationState } from '@tanstack/react-table';
import { DataTable } from '@/pattern/common/organisms/table/data-table';
import { TableToolbar } from '@/pattern/common/molecules/table-toolbar';
import { useGetVendorComplaintsQuery } from '@/redux/services/vendor-details/vendor-details.api-slice';
import { createComplaintColumns } from '../molecules/complaint-columns';

const PAGE_SIZE = 5;

export const ComplaintTable = ({ businessId }: { businessId: string }) => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });
  const [search, setSearch] = useState('');

  const { data, isLoading, isFetching, isSuccess, isError, error } =
    useGetVendorComplaintsQuery({
      businessId,
      page: pagination.pageIndex + 1,
      size: pagination.pageSize,
      search,
    });

  const columns = useMemo(
    () =>
      createComplaintColumns({
        onViewDetails: () => toast.info('Complaint details coming soon'),
      }),
    []
  );

  const rows = data?.data?.data ?? [];
  const totalCount =
    data?.data?.totalCount ?? data?.data?.total ?? rows.length;
  const pageCount = Math.max(Math.ceil(totalCount / pagination.pageSize), 1);

  return (
    <DataTable
      columns={columns}
      data={rows}
      isLoading={isLoading}
      isFetching={isFetching}
      isSuccess={isSuccess}
      isError={isError}
      error={error}
      pagination={pagination}
      setPagination={setPagination}
      pageCount={pageCount}
      emptyMessage="No complaints yet."
      loadingMessage="Loading complaints..."
      toolbar={
        <TableToolbar
          title="Complaint"
          search={search}
          onSearchChange={setSearch}
        />
      }
    />
  );
};

'use client';

import { useMemo, useState } from 'react';
import type { PaginationState } from '@tanstack/react-table';
import { DataTable } from '@/pattern/common/organisms/table/data-table';
import { TableToolbar } from '@/pattern/common/molecules/table-toolbar';
import { readPageCount, readTotalItems } from '@/redux/services/types';
import {
  useGetVendorTransactionsQuery,
  type VendorActivity,
} from '@/redux/services/vendor-details/vendor-details.api-slice';
import { createActivityLogColumns } from '../molecules/activity-log-columns';

const PAGE_SIZE = 5;

/**
 * Vendor wallet activity, from GET /admin/businesses/:id/transactions.
 *
 * This was previously an empty card: the only vendor ledger endpoint,
 * `GET /transactions/vendor`, derives the business from the caller's own token,
 * so an admin calling it made the backend dereference an absent business and
 * return a 500 whose message was rendered straight into this table. The admin
 * route takes the id in the path instead.
 */
export const ActivityLogTable = ({ businessId }: { businessId: string }) => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });

  const { data, isLoading, isFetching, isSuccess, isError, error } =
    useGetVendorTransactionsQuery(
      {
        businessId,
        page: pagination.pageIndex + 1,
        size: pagination.pageSize,
      },
      { skip: !businessId }
    );

  const columns = useMemo(() => createActivityLogColumns(), []);
  const rows = (data?.data?.data ?? []) as VendorActivity[];
  const totalRows = readTotalItems(data?.data) ?? rows.length;
  const pageCount = readPageCount(data?.data, pagination.pageSize);

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
      totalRows={totalRows}
      emptyMessage="No transactions yet."
      loadingMessage="Loading activity..."
      toolbar={
        // No search or export: the ledger endpoint takes only page, size and
        // status, so a search box here could filter one page and not the rest.
        <TableToolbar
          title="Activity Log"
          showSearch={false}
          showFilter={false}
          showExport={false}
        />
      }
    />
  );
};

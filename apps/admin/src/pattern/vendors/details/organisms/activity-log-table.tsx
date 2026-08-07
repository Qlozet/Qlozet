'use client';

import { useMemo, useState } from 'react';
import type { PaginationState } from '@tanstack/react-table';
import { DataTable } from '@/pattern/common/organisms/table/data-table';
import { TableToolbar } from '@/pattern/common/molecules/table-toolbar';
import type { VendorActivity } from '@/redux/services/vendor-details/vendor-details.api-slice';
import { createActivityLogColumns } from '../molecules/activity-log-columns';

const PAGE_SIZE = 5;

/**
 * Vendor wallet activity.
 *
 * TODO(api): there is no admin endpoint for another business's transactions.
 * `GET /transactions/vendor` looks like one, but its only params are
 * `status` (required), `page` and `size` — no `businessId`. It derives the
 * business from the caller's own token, so calling it from the admin console
 * made the backend dereference an absent business and return a 500 whose
 * message ("Cannot read properties of undefined (reading 'toString')") was
 * rendered straight into this card.
 *
 * Wire this to a real admin transactions endpoint when one ships; the columns
 * and table below are ready for it. Until then it shows an honest empty state
 * rather than calling an endpoint that cannot work.
 */
export const ActivityLogTable = ({ businessId }: { businessId: string }) => {
  void businessId;

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });
  const [search, setSearch] = useState('');

  const columns = useMemo(() => createActivityLogColumns(), []);
  const rows = useMemo<VendorActivity[]>(() => [], []);

  return (
    <DataTable
      columns={columns}
      data={rows}
      isSuccess
      pagination={pagination}
      setPagination={setPagination}
      pageCount={1}
      emptyMessage="Vendor transaction history isn't available yet."
      toolbar={
        // No date filter or export: there's no activity data source to act on.
        <TableToolbar
          title="Activity Log"
          search={search}
          onSearchChange={setSearch}
          showFilter={false}
          showExport={false}
        />
      }
    />
  );
};

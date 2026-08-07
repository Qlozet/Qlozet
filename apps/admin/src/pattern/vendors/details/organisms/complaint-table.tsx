'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { PaginationState } from '@tanstack/react-table';
import { DataTable } from '@/pattern/common/organisms/table/data-table';
import { TableToolbar } from '@/pattern/common/molecules/table-toolbar';
import { useGetVendorComplaintsQuery } from '@/redux/services/vendor-details/vendor-details.api-slice';
import { APP_ROUTES } from '@/lib/routes';
import { createComplaintColumns } from '../molecules/complaint-columns';

const PAGE_SIZE = 5;

export const ComplaintTable = ({ businessId }: { businessId: string }) => {
  const router = useRouter();
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });

  const { data, isLoading, isFetching, isSuccess, isError, error } =
    useGetVendorComplaintsQuery({
      businessId,
      page: pagination.pageIndex + 1,
      size: pagination.pageSize,
    });

  // Complaints are tickets — the admin ticket detail screen already exists.
  const columns = useMemo(
    () =>
      createComplaintColumns({
        onViewDetails: (ticketId) => {
          if (!ticketId) {
            toast.error("This complaint has no id — it can't be opened.");
            return;
          }
          router.push(`${APP_ROUTES.support}/${ticketId}`);
        },
      }),
    [router]
  );

  const rows = data?.data?.data ?? [];
  const totalCount = data?.data?.totalCount ?? data?.data?.total ?? rows.length;
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
        // No search box: /admin/tickets exposes a single `search` param, and
        // it's already spent scoping results to this vendor.
        <TableToolbar title="Complaint" showSearch={false} />
      }
    />
  );
};

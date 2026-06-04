'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { PaginationState, OnChangeFn } from '@tanstack/react-table';
import { APP_ROUTES } from '@/lib/routes';
import { DataTable } from '@/pattern/common/organisms/table/data-table';
import type { Business } from '@/redux/services/businesses/businesses.api-slice';
import {
  useApproveBusinessMutation,
  useVerifyBusinessMutation,
  useRejectBusinessMutation,
} from '@/redux/services/businesses/businesses.api-slice';
import { createVendorsTableColumns } from '../molecules/vendors-table-columns';

interface VendorsTableProps {
  data: Business[];
  isLoading: boolean;
  isFetching: boolean;
  isSuccess: boolean;
  isError: boolean;
  error?: unknown;
  pagination: PaginationState;
  setPagination: OnChangeFn<PaginationState>;
  pageCount: number;
}

export const VendorsTable = ({
  data,
  isLoading,
  isFetching,
  isSuccess,
  isError,
  error,
  pagination,
  setPagination,
  pageCount,
}: VendorsTableProps) => {
  const router = useRouter();

  const [approve] = useApproveBusinessMutation();
  const [verify] = useVerifyBusinessMutation();
  const [reject] = useRejectBusinessMutation();

  const runMutation = async (
    action: (id: string) => { unwrap: () => Promise<unknown> },
    id: string,
    successMsg: string
  ) => {
    try {
      await action(id).unwrap();
      toast.success(successMsg);
    } catch {
      toast.error('Something went wrong. Please try again.');
    }
  };

  const columns = useMemo(
    () =>
      createVendorsTableColumns({
        onViewDetails: (id) => router.push(`${APP_ROUTES.vendors}/${id}`),
        onApprove: (id) => runMutation(approve, id, 'Vendor approved'),
        onVerify: (id) => runMutation(verify, id, 'Vendor verified'),
        onReject: (id) => runMutation(reject, id, 'Vendor rejected'),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router, approve, verify, reject]
  );

  return (
    <DataTable<Business>
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
      onRowClick={(vendor) => router.push(`${APP_ROUTES.vendors}/${vendor._id}`)}
      emptyMessage="No vendors found."
      loadingMessage="Loading vendors..."
    />
  );
};

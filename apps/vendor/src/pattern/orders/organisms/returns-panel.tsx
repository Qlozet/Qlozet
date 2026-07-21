'use client';

// Returns panel — the "Returns" tab on the vendor Orders page.
// Lists returns raised against the vendor's orders and lets the vendor
// approve / reject a pending return, or mark an approved one as received
// (which triggers the backend auto-refund).

import React, { useMemo, useState } from 'react';
import type { PaginationState } from '@tanstack/react-table';
import { toast } from 'sonner';
import { DataTable } from '@/pattern/common/organisms/table/data-table';
import { TableToolbar } from '@/pattern/common/molecules/table-toolbar';
import { FilterMenu, type FilterOption } from '@/pattern/common/molecules/filter-menu';
import {
  useGetVendorReturnsQuery,
  useApproveReturnMutation,
  useRejectReturnMutation,
  useMarkReturnReceivedMutation,
  type ReturnRequest,
} from '@/redux/services/returns/returns.api-slice';
import { createReturnsColumns } from '../molecules/returns-table-columns';
import {
  readReturnCustomer,
  readReturnRef,
  type ReturnStatusFilter,
} from '../lib/return-fields';

const PAGE_SIZE = 7;

const STATUS_OPTIONS: FilterOption<ReturnStatusFilter>[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'received', label: 'Received' },
  { value: 'refunded', label: 'Refunded' },
];

const errMessage = (err: unknown, fallback: string): string =>
  (err as { data?: { message?: string } })?.data?.message || fallback;

export const ReturnsPanel: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReturnStatusFilter>('all');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });

  const { data, isLoading, isFetching, isSuccess, isError, error } =
    useGetVendorReturnsQuery({
      page: pagination.pageIndex + 1,
      size: pagination.pageSize,
      status: statusFilter === 'all' ? undefined : statusFilter,
    });

  const [approveReturn] = useApproveReturnMutation();
  const [rejectReturn] = useRejectReturnMutation();
  const [markReceived] = useMarkReturnReceivedMutation();

  const returns = useMemo<ReturnRequest[]>(() => data?.data?.data ?? [], [data]);

  // Server has no text search, so filter client-side across the scannable fields.
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return returns;
    return returns.filter((r) =>
      [readReturnRef(r), readReturnCustomer(r)]
        .filter(Boolean)
        .some((f) => f.toLowerCase().includes(q))
    );
  }, [returns, search]);

  const runAction = async (
    r: ReturnRequest,
    action: () => Promise<unknown>,
    successMsg: string,
    fallbackErr: string
  ) => {
    setBusyId(r._id);
    try {
      await action();
      toast.success(successMsg);
    } catch (err) {
      toast.error(errMessage(err, fallbackErr));
    } finally {
      setBusyId(null);
    }
  };

  const columns = useMemo(
    () =>
      createReturnsColumns({
        busyId,
        onApprove: (r) =>
          runAction(
            r,
            () => approveReturn(r._id).unwrap(),
            'Return approved.',
            'Could not approve the return.'
          ),
        onReject: (r) =>
          runAction(
            r,
            () => rejectReturn({ id: r._id }).unwrap(),
            'Return rejected.',
            'Could not reject the return.'
          ),
        onReceived: (r) =>
          runAction(
            r,
            () => markReceived(r._id).unwrap(),
            'Marked as received — refund will be issued.',
            'Could not mark the return as received.'
          ),
      }),
    // runAction/mutations are stable; busyId is the only reactive input.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [busyId]
  );

  const totalPages =
    data?.data?.total_pages ?? data?.data?.totalPages ?? 1;

  return (
    <div className='bg-card w-full rounded-[10px] shadow-md'>
      <TableToolbar
        title='Returns'
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPagination((prev) => ({ ...prev, pageIndex: 0 }));
        }}
        filterControl={
          <FilterMenu
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={(value) => {
              setStatusFilter(value);
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }}
          />
        }
      />
      <DataTable
        columns={columns}
        data={filtered}
        isLoading={isLoading}
        isFetching={isFetching}
        isSuccess={isSuccess}
        isError={isError}
        error={error}
        pagination={pagination}
        setPagination={setPagination}
        pageCount={totalPages}
        manualPagination
        emptyTitle='No returns yet'
        emptyMessage='Return requests from customers will show up here.'
        minWidth='900px'
      />
    </div>
  );
};

export default ReturnsPanel;
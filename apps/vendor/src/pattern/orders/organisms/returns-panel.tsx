'use client';

// Returns panel — the "Returns" tab on the vendor Orders page.
// Lists returns raised against the vendor's orders and lets the vendor
// approve / reject a pending return, or mark an approved one as received
// (which triggers the backend auto-refund).

import React, { useMemo, useState } from 'react';
import type { PaginationState } from '@tanstack/react-table';
import NiceModal from '@ebay/nice-modal-react';
import { toast } from 'sonner';
import { DataTable } from '@/pattern/common/organisms/table/data-table';
import { TableToolbar } from '@/pattern/common/molecules/table-toolbar';
import {
  FilterMenu,
  type FilterOption,
} from '@/pattern/common/molecules/filter-menu';
import {
  useGetVendorReturnsQuery,
  useApproveReturnMutation,
  useMarkReturnReceivedMutation,
  type ReturnRequest,
} from '@/redux/services/returns/returns.api-slice';
import { RejectReturnModal } from './reject-return-modal';
import { createReturnsColumns } from '../molecules/returns-table-columns';
import {
  readReturnCustomer,
  readReturnRef,
  type ReturnStatusFilter,
} from '../lib/return-fields';
import { readApiError } from '@/redux/services/types';

const PAGE_SIZE = 7;

const STATUS_OPTIONS: FilterOption<ReturnStatusFilter>[] = [
  { value: 'all', label: 'All' },
  { value: 'requested', label: 'Waiting for you' },
  { value: 'vendor_approved', label: 'Approved' },
  { value: 'refund_processed', label: 'Refunded' },
  { value: 'vendor_rejected', label: 'Rejected' },
];

const errMessage = (err: unknown, fallback: string): string =>
  readApiError(err, fallback);

export const ReturnsPanel: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReturnStatusFilter>('all');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });

  // The server returns every return for the vendor as a plain list (the
  // envelope's data is the array) and filters by status; the table pages
  // through it client-side. Reading data.data.data, as this did, always
  // came back empty.
  const { data, isLoading, isFetching, isSuccess, isError, error } =
    useGetVendorReturnsQuery({
      status: statusFilter === 'all' ? undefined : statusFilter,
    });

  const [approveReturn] = useApproveReturnMutation();
  const [markReceived] = useMarkReturnReceivedMutation();

  const returns = useMemo<ReturnRequest[]>(() => {
    const payload = data?.data as unknown;
    if (Array.isArray(payload)) return payload as ReturnRequest[];
    const nested = payload as { data?: ReturnRequest[] } | undefined;
    return nested?.data ?? [];
  }, [data]);

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
          NiceModal.show(RejectReturnModal, { returnRequest: r }),
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

  return (
    <div className="bg-card w-full rounded-xl border custom-card-shadow">
      <TableToolbar
        title="Returns"
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
        emptyTitle="No returns yet"
        emptyMessage="Return requests from customers will show up here."
        minWidth="900px"
      />
    </div>
  );
};

export default ReturnsPanel;

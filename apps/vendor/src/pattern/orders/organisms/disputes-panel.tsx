'use client';

// Disputes panel — the "Disputes" tab on the vendor Orders page.
// Lists disputes raised against the vendor's orders and lets the vendor submit
// a counter-response via the Respond modal.

import React, { useMemo, useState } from 'react';
import NiceModal from '@ebay/nice-modal-react';
import type { PaginationState } from '@tanstack/react-table';
import { DataTable } from '@/pattern/common/organisms/table/data-table';
import { TableToolbar } from '@/pattern/common/molecules/table-toolbar';
import { FilterMenu, type FilterOption } from '@/pattern/common/molecules/filter-menu';
import {
  useGetVendorDisputesQuery,
  type Dispute,
} from '@/redux/services/disputes/disputes.api-slice';
import { createDisputesColumns } from '../molecules/disputes-table-columns';
import { RespondDisputeModal } from './respond-dispute-modal';
import {
  readDisputeCustomer,
  readDisputeRef,
  type DisputeStatusFilter,
} from '../lib/dispute-fields';

const PAGE_SIZE = 7;

const STATUS_OPTIONS: FilterOption<DisputeStatusFilter>[] = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'vendor_responded', label: 'Responded' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'rejected', label: 'Rejected' },
];

export const DisputesPanel: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<DisputeStatusFilter>('all');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });

  const { data, isLoading, isFetching, isSuccess, isError, error } =
    useGetVendorDisputesQuery({
      page: pagination.pageIndex + 1,
      size: pagination.pageSize,
      status: statusFilter === 'all' ? undefined : statusFilter,
    });

  const disputes = useMemo<Dispute[]>(() => data?.data?.data ?? [], [data]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return disputes;
    return disputes.filter((d) =>
      [readDisputeRef(d), readDisputeCustomer(d)]
        .filter(Boolean)
        .some((f) => f.toLowerCase().includes(q))
    );
  }, [disputes, search]);

  const columns = useMemo(
    () =>
      createDisputesColumns({
        onRespond: (d) => NiceModal.show(RespondDisputeModal, { dispute: d }),
      }),
    []
  );

  const totalPages = data?.data?.total_pages ?? data?.data?.totalPages ?? 1;

  return (
    <div className='bg-card w-full rounded-[10px] shadow-md'>
      <TableToolbar
        title='Disputes'
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
        emptyTitle='No disputes'
        emptyMessage='Disputes raised by customers will show up here.'
        minWidth='900px'
      />
    </div>
  );
};

export default DisputesPanel;
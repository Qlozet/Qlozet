'use client';

import { useMemo, useState } from 'react';
import type { PaginationState } from '@tanstack/react-table';
import { DataTable } from '@/pattern/common/organisms/table/data-table';
import { TableToolbar } from '@/pattern/common/molecules/table-toolbar';
import {
  useGetAdminDisputesQuery,
  type Dispute,
} from '@/redux/services/disputes/disputes.api-slice';
import { createDisputesColumns } from '../molecules/disputes-columns';
import { ResolveDisputeModal } from '../organisms/resolve-dispute-modal';
import {
  STATUS_FILTERS,
  customerName,
  vendorName,
} from '../lib/dispute-labels';

const PAGE_SIZE = 10;

export default function DisputesTableTemplate() {
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [active, setActive] = useState<Dispute | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });

  const { data, isLoading, isFetching, isSuccess, isError, error } =
    useGetAdminDisputesQuery(status ? { status } : undefined);

  const all: Dispute[] = useMemo(() => data ?? [], [data]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return all;
    return all.filter((d) => {
      return (
        d.order_reference.toLowerCase().includes(q) ||
        customerName(d.customer).toLowerCase().includes(q) ||
        vendorName(d.business).toLowerCase().includes(q)
      );
    });
  }, [all, search]);

  const pageCount = Math.max(
    1,
    Math.ceil(filtered.length / pagination.pageSize)
  );
  const pageData = useMemo(
    () =>
      filtered.slice(
        pagination.pageIndex * pagination.pageSize,
        (pagination.pageIndex + 1) * pagination.pageSize
      ),
    [filtered, pagination]
  );

  const columns = useMemo(
    () => createDisputesColumns({ onResolve: (d) => setActive(d) }),
    []
  );

  return (
    <>
      <DataTable<Dispute>
        columns={columns}
        data={pageData}
        isLoading={isLoading}
        isFetching={isFetching}
        isSuccess={isSuccess}
        isError={isError}
        error={error}
        pagination={pagination}
        setPagination={setPagination}
        pageCount={pageCount}
        emptyMessage="No disputes to review."
        toolbar={
          <TableToolbar
            title="Disputes"
            search={search}
            onSearchChange={(v) => {
              setSearch(v);
              setPagination((p) => ({ ...p, pageIndex: 0 }));
            }}
            showExport={false}
            rightExtra={
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPagination((p) => ({ ...p, pageIndex: 0 }));
                }}
                className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200"
              >
                {STATUS_FILTERS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            }
          />
        }
      />

      <ResolveDisputeModal dispute={active} onClose={() => setActive(null)} />
    </>
  );
}

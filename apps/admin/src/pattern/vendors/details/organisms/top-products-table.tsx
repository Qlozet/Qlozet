'use client';

import { useMemo, useState } from 'react';
import type { PaginationState } from '@tanstack/react-table';
import { DataTable } from '@/pattern/common/organisms/table/data-table';
import { TableToolbar } from '@/pattern/common/molecules/table-toolbar';
import { useGetVendorTopProductsQuery } from '@/redux/services/vendor-details/vendor-details.api-slice';
import { createTopProductsColumns } from '../molecules/top-products-columns';

const PAGE_SIZE = 5;
// How many best sellers the server aggregates; search/pagination below happen
// client-side within this bounded, already-ranked list.
const TOP_LIMIT = 25;

export const TopProductsTable = ({ businessId }: { businessId: string }) => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });
  const [search, setSearch] = useState('');

  const { data, isLoading, isFetching, isSuccess, isError, error } =
    useGetVendorTopProductsQuery({ businessId, limit: TOP_LIMIT });

  const columns = useMemo(() => createTopProductsColumns(), []);

  const all = useMemo(() => data?.data ?? [], [data]);
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return all;
    return all.filter(
      (p) =>
        (p.name ?? '').toLowerCase().includes(q) ||
        (p.kind ?? '').toLowerCase().includes(q)
    );
  }, [all, search]);

  const pageCount = Math.max(
    1,
    Math.ceil(filtered.length / pagination.pageSize)
  );
  const rows = useMemo(
    () =>
      filtered.slice(
        pagination.pageIndex * pagination.pageSize,
        (pagination.pageIndex + 1) * pagination.pageSize
      ),
    [filtered, pagination]
  );

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
      emptyMessage="No sales yet — top products appear once orders come in."
      loadingMessage="Loading top products..."
      toolbar={
        <TableToolbar
          title="Top Products"
          search={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPagination((p) => ({ ...p, pageIndex: 0 }));
          }}
        />
      }
    />
  );
};

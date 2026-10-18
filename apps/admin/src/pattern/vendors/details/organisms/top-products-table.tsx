'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { PaginationState } from '@tanstack/react-table';
import { DataTable } from '@/pattern/common/organisms/table/data-table';
import { TableToolbar } from '@/pattern/common/molecules/table-toolbar';
import { APP_ROUTES } from '@/lib/routes';
import { formatCurrency } from '@/lib/utils';
import { useGetVendorTopProductsQuery } from '@/redux/services/vendor-details/vendor-details.api-slice';
import { createTopProductsColumns } from '../molecules/top-products-columns';

const PAGE_SIZE = 5;
// How many best sellers the server aggregates; search/pagination below happen
// client-side within this bounded, already-ranked list.
const TOP_LIMIT = 25;

export const TopProductsTable = ({ businessId }: { businessId: string }) => {
  const router = useRouter();
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });
  const [search, setSearch] = useState('');

  const { data, isLoading, isFetching, isSuccess, isError, error } =
    useGetVendorTopProductsQuery({ businessId, limit: TOP_LIMIT });

  const all = useMemo(() => data?.data ?? [], [data]);

  // The bars and the share column are relative to everything the server
  // ranked, not to the page or the search, so they do not jump about.
  const totals = useMemo(
    () => ({
      revenue: all.reduce((sum, p) => sum + (p.revenue ?? 0), 0),
      units: all.reduce((sum, p) => sum + (p.units_sold ?? 0), 0),
      maxRevenue: all.reduce((max, p) => Math.max(max, p.revenue ?? 0), 0),
    }),
    [all]
  );

  const columns = useMemo(
    () =>
      createTopProductsColumns({
        maxRevenue: totals.maxRevenue,
        totalRevenue: totals.revenue,
      }),
    [totals]
  );

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
      totalRows={filtered.length}
      onRowClick={(p) =>
        router.push(`${APP_ROUTES.productDetails}?id=${p._id}`)
      }
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
          rightExtra={
            all.length > 0 ? (
              <span className="hidden text-xs tabular-nums text-muted-foreground sm:inline">
                {totals.units.toLocaleString()} units ·{' '}
                {formatCurrency(totals.revenue, 'NGN')} across the top{' '}
                {all.length}
              </span>
            ) : undefined
          }
        />
      }
    />
  );
};

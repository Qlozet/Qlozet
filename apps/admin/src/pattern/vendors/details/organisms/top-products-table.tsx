'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { PaginationState } from '@tanstack/react-table';
import { DataTable } from '@/pattern/common/organisms/table/data-table';
import { TableToolbar } from '@/pattern/common/molecules/table-toolbar';
import { APP_ROUTES } from '@/lib/routes';
import { cn, formatCurrency } from '@/lib/utils';
import { useGetVendorTopProductsQuery } from '@/redux/services/vendor-details/vendor-details.api-slice';
import { createTopProductsColumns } from '../molecules/top-products-columns';

const PAGE_SIZE = 5;
// How many best sellers the server aggregates; search/pagination below happen
// client-side within this bounded, already-ranked list.
const TOP_LIMIT = 25;

/** All time answers "what built this shop"; 30 days answers "what sells now". */
const RANGES: { days: number; label: string }[] = [
  { days: 30, label: '30 days' },
  { days: 90, label: '90 days' },
  { days: 0, label: 'All time' },
];

const KIND_LABEL: Record<string, string> = {
  clothing: 'Clothing',
  fabric: 'Fabric',
  accessory: 'Accessories',
};

export const TopProductsTable = ({ businessId }: { businessId: string }) => {
  const router = useRouter();
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });
  const [search, setSearch] = useState('');
  const [days, setDays] = useState(0);

  const { data, isLoading, isFetching, isSuccess, isError, error } =
    useGetVendorTopProductsQuery({
      businessId,
      limit: TOP_LIMIT,
      days: days || undefined,
    });

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

  // Revenue by kind across the ranked list, biggest first.
  const mix = useMemo(() => {
    if (!totals.revenue) return [];
    const byKind = new Map<string, number>();
    for (const p of all) {
      const key = p.kind ?? 'other';
      byKind.set(key, (byKind.get(key) ?? 0) + (p.revenue ?? 0));
    }
    return [...byKind.entries()]
      .map(([kind, revenue]) => ({
        kind,
        label: KIND_LABEL[kind] ?? 'Other',
        share: Math.round((revenue / totals.revenue) * 100),
      }))
      .filter((m) => m.share > 0)
      .sort((a, b) => b.share - a.share);
  }, [all, totals.revenue]);

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
      emptyMessage={
        days
          ? `No sales in the last ${days} days.`
          : 'No sales yet — top products appear once orders come in.'
      }
      loadingMessage="Loading top products..."
      toolbar={
        <div>
          <TableToolbar
            title="Top Products"
            search={search}
            onSearchChange={(v) => {
              setSearch(v);
              setPagination((p) => ({ ...p, pageIndex: 0 }));
            }}
            rightExtra={
              <div
                role="group"
                aria-label="Sales period"
                className="inline-flex items-center rounded-full bg-gray-100 p-0.5 text-xs font-medium dark:bg-muted"
              >
                {RANGES.map((r) => (
                  <button
                    key={r.days}
                    type="button"
                    aria-pressed={days === r.days}
                    onClick={() => {
                      setDays(r.days);
                      setPagination((p) => ({ ...p, pageIndex: 0 }));
                    }}
                    className={cn(
                      'cursor-pointer rounded-full px-2.5 py-1 transition-colors',
                      days === r.days
                        ? 'bg-white text-gray-900 shadow-sm dark:bg-card dark:text-white'
                        : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white'
                    )}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            }
          />
          {all.length > 0 && (
            <p className="-mt-2 px-6 pb-4 text-xs tabular-nums text-muted-foreground">
              {totals.units.toLocaleString()} units ·{' '}
              {formatCurrency(totals.revenue, 'NGN')} across the top{' '}
              {all.length}
              {mix.length > 0 &&
                ` · ${mix.map((m) => `${m.label} ${m.share}%`).join(', ')}`}
            </p>
          )}
        </div>
      }
    />
  );
};

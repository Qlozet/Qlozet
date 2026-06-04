'use client';

import { useMemo, useState } from 'react';
import type { PaginationState } from '@tanstack/react-table';
import { DataTable } from '@/pattern/common/organisms/table/data-table';
import { TableToolbar } from '@/pattern/common/molecules/table-toolbar';
import { useGetVendorProductsQuery } from '@/redux/services/vendor-details/vendor-details.api-slice';
import { createTopProductsColumns } from '../molecules/top-products-columns';
import { FALLBACK_PRODUCTS } from '../mock-data';

const PAGE_SIZE = 5;

export const TopProductsTable = ({ businessId }: { businessId: string }) => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });
  const [search, setSearch] = useState('');

  const { data, isLoading, isFetching, isSuccess, isError, error } =
    useGetVendorProductsQuery({
      businessId,
      page: pagination.pageIndex + 1,
      size: pagination.pageSize,
    });

  const columns = useMemo(() => createTopProductsColumns(), []);

  const apiRows = data?.data?.data ?? [];
  const rows = apiRows.length ? apiRows : FALLBACK_PRODUCTS;
  const totalCount =
    data?.data?.totalCount ?? data?.data?.total ?? rows.length;
  const pageCount = Math.max(Math.ceil(totalCount / pagination.pageSize), 1);

  return (
    <DataTable
      columns={columns}
      data={rows}
      isLoading={isLoading}
      isFetching={isFetching}
      isSuccess={isSuccess || apiRows.length === 0}
      isError={isError && apiRows.length === 0 ? false : isError}
      error={error}
      pagination={pagination}
      setPagination={setPagination}
      pageCount={pageCount}
      emptyMessage="No products yet."
      loadingMessage="Loading products..."
      toolbar={
        <TableToolbar
          title="Top Products"
          search={search}
          onSearchChange={setSearch}
        />
      }
    />
  );
};

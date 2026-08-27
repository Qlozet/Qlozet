'use client';

import { useEffect, useMemo, useState } from 'react';
import type { PaginationState } from '@tanstack/react-table';
import { readPageCount, readTotalItems } from '@/redux/services/types';
import {
  useGetAdminProductFiltersQuery,
  useGetAdminProductStatsQuery,
  useGetAdminProductsQuery,
  type AdminProductsParams,
} from '@/redux/services/products/admin-products.api-slice';
import {
  EMPTY_PRODUCT_FILTERS,
  type ProductFilters,
} from '../molecules/product-filters';

const PAGE_SIZE = 5;
const SEARCH_DEBOUNCE_MS = 400;

/**
 * Everything the Clothing / Accessories / Fabric catalogue pages share:
 * debounced search, filters, pagination and the three admin queries behind
 * them. The pages were three near-identical copies of this, each reading
 * pagination totals off keys the API doesn't send (`totalCount` / `total`
 * instead of `total_items`), which pinned every table to a single page.
 */
export const useProductCatalogue = (kind: string) => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filters, setFilters] = useState<ProductFilters>(EMPTY_PRODUCT_FILTERS);

  // Debounce the search input so we don't refetch on every keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search]);

  // Any narrowing invalidates the current page number — page 3 of the old
  // result set is usually past the end of the new one, which reads as "no
  // results" when there are plenty on page 1.
  useEffect(() => {
    setPagination((prev) =>
      prev.pageIndex === 0 ? prev : { ...prev, pageIndex: 0 }
    );
  }, [debouncedSearch, filters]);

  const queryArgs: AdminProductsParams = useMemo(
    () => ({
      kind,
      page: pagination.pageIndex + 1,
      size: pagination.pageSize,
      search: debouncedSearch || undefined,
      status: filters.status,
      moderation_status: filters.moderation_status,
      product_type: filters.product_type,
      category: filters.category,
      audience: filters.audience,
      tag: filters.tag,
      business_id: filters.business_id,
      minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
      maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
      in_stock: filters.in_stock || undefined,
      on_sale: filters.on_sale || undefined,
    }),
    [kind, pagination.pageIndex, pagination.pageSize, debouncedSearch, filters]
  );

  const { data, isLoading, isFetching, isSuccess, isError, error } =
    useGetAdminProductsQuery(queryArgs);

  // The header cards describe the whole catalogue for this kind, so they follow
  // the filters but not the page.
  const { data: statsData, isLoading: isLoadingStats } =
    useGetAdminProductStatsQuery({
      ...queryArgs,
      page: undefined,
      size: undefined,
    });

  const { data: filterData, isLoading: isLoadingFilters } =
    useGetAdminProductFiltersQuery({ kind });

  const paginated = data?.data;
  const products = useMemo(() => paginated?.data ?? [], [paginated]);
  const stats = statsData?.data;

  return {
    products,
    stats,
    filterOptions: filterData?.data,
    isLoadingFilters,
    isLoadingStats,
    isLoading,
    isFetching,
    isSuccess,
    isError,
    error,
    search,
    setSearch,
    filters,
    setFilters,
    pagination,
    setPagination,
    totalCount: readTotalItems(paginated),
    pageCount: readPageCount(paginated, pagination.pageSize),
  };
};

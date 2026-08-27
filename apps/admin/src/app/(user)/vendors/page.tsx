'use client';

import { useCallback, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import type { PaginationState } from '@tanstack/react-table';
import NiceModal from '@ebay/nice-modal-react';
import { WorkInProgressModal } from '@/pattern/common/organisms/work-in-progress-modal';
import { VendorStatsCards } from '@/pattern/vendors/templates/vendor-stats-cards';
import { VendorsTableTemplate } from '@/pattern/vendors/templates/vendors-table-template';
import {
  useGetBusinessesQuery,
  type VendorSummary,
} from '@/redux/services/businesses/businesses.api-slice';

const PAGE_SIZE = 8;

const VendorsPage = () => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  // undefined = the endpoint's default order (oldest first).
  const [revenueSort, setRevenueSort] = useState<'asc' | 'desc' | undefined>(
    undefined
  );

  const { data, isLoading, isFetching, isSuccess, isError, error } =
    useGetBusinessesQuery({
      page: pagination.pageIndex + 1,
      size: pagination.pageSize,
      status: status || undefined,
      search: search || undefined,
      // Both or neither: `order` alone would silently reverse the default sort.
      sort: revenueSort ? 'revenue' : undefined,
      order: revenueSort,
    });

  const paginated = data?.data as any;
  const vendors = useMemo(() => paginated?.data ?? [], [paginated]);
  const totalCount =
    paginated?.total_items ??
    paginated?.totalCount ??
    paginated?.total ??
    vendors.length;
  const pageCountFromApi = paginated?.total_pages ?? paginated?.totalPages;
  const pageCount =
    pageCountFromApi ||
    Math.max(Math.ceil(totalCount / pagination.pageSize), 1);

  const summary = paginated?.summary as VendorSummary | undefined;

  // Any change to what is being listed sends the reader back to page 1 —
  // otherwise a filter that yields two pages can leave you stranded on page 4
  // looking at an empty table.
  const toFirstPage = () =>
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));

  const handleStatusChange = (next: string) => {
    setStatus(next);
    toFirstPage();
  };

  const handleSearchChange = (next: string) => {
    setSearch(next);
    toFirstPage();
  };

  // desc -> asc -> off, so a third click restores the default order rather
  // than trapping the table in a sort.
  const toggleRevenueSort = useCallback(() => {
    setRevenueSort((current) =>
      current === undefined ? 'desc' : current === 'desc' ? 'asc' : undefined
    );
    toFirstPage();
  }, []);

  return (
    <div className="w-full min-h-screen h-fit space-y-6 pb-10">
      {/* No Add Vendor action: vendors self-register through
          POST /auth/register/vendor, which sets a password and sends an email
          verification link. There is no admin-side create endpoint, so this
          console can only review and approve businesses, not create them. */}

      {/* Vendor metrics */}
      <VendorStatsCards
        summary={summary}
        totalFromList={totalCount}
        isLoading={isLoading}
      />

      {/* Vendors table */}
      <VendorsTableTemplate
        vendors={vendors}
        isLoading={isLoading}
        isFetching={isFetching}
        isSuccess={isSuccess}
        isError={isError}
        error={error}
        status={status}
        onStatusChange={handleStatusChange}
        search={search}
        onSearchChange={handleSearchChange}
        revenueSort={revenueSort}
        onToggleRevenueSort={toggleRevenueSort}
        pagination={pagination}
        setPagination={setPagination}
        pageCount={pageCount}
        totalRows={totalCount}
      />
    </div>
  );
};

export default VendorsPage;

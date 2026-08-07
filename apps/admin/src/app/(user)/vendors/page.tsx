'use client';

import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import type { PaginationState } from '@tanstack/react-table';
import NiceModal from '@ebay/nice-modal-react';
import { WorkInProgressModal } from '@/pattern/common/organisms/work-in-progress-modal';
import { VendorStatsCards } from '@/pattern/vendors/templates/vendor-stats-cards';
import { VendorsTableTemplate } from '@/pattern/vendors/templates/vendors-table-template';
import { useGetBusinessesQuery } from '@/redux/services/businesses/businesses.api-slice';

const PAGE_SIZE = 8;

const VendorsPage = () => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });
  const [status, setStatus] = useState('');

  const { data, isLoading, isFetching, isSuccess, isError, error } =
    useGetBusinessesQuery({
      page: pagination.pageIndex + 1,
      size: pagination.pageSize,
      status: status || undefined,
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

  const handleStatusChange = (next: string) => {
    setStatus(next);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  return (
    <div className="w-full min-h-screen h-fit space-y-6 pb-10">
      {/* No Add Vendor action: vendors self-register through
          POST /auth/register/vendor, which sets a password and sends an email
          verification link. There is no admin-side create endpoint, so this
          console can only review and approve businesses, not create them. */}

      {/* Vendor metrics */}
      <VendorStatsCards totalFromList={totalCount} />

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
        pagination={pagination}
        setPagination={setPagination}
        pageCount={pageCount}
      />
    </div>
  );
};

export default VendorsPage;

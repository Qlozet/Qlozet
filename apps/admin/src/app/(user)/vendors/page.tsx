'use client';

import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import type { PaginationState } from '@tanstack/react-table';
import NiceModal from '@ebay/nice-modal-react';
import { WorkInProgressModal } from '@/pattern/common/organisms/work-in-progress-modal';
import { VendorStatsCards } from '@/pattern/vendors/templates/vendor-stats-cards';
import { VendorsTableTemplate } from '@/pattern/vendors/templates/vendors-table-template';
import { useGetBusinessesQuery } from '@/redux/services/businesses/businesses.api-slice';

const PAGE_SIZE = 5;

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

  const paginated = data?.data;
  const vendors = useMemo(() => paginated?.data ?? [], [paginated]);
  const totalCount =
    paginated?.totalCount ?? paginated?.total ?? vendors.length;
  const pageCount = Math.max(Math.ceil(totalCount / pagination.pageSize), 1);

  const handleStatusChange = (next: string) => {
    setStatus(next);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const showAddVendor = () => NiceModal.show(WorkInProgressModal);

  return (
    <div className="w-full min-h-screen h-fit space-y-6 pb-10">
      {/* Add Vendor */}
      <div>
        <button
          type="button"
          onClick={showAddVendor}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer"
        >
          Add Vendor
          <span className="flex size-5 items-center justify-center rounded-full bg-white/20">
            <Plus className="size-3.5" />
          </span>
        </button>
      </div>

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

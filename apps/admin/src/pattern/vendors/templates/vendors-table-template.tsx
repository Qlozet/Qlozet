'use client';

import type { PaginationState, OnChangeFn } from '@tanstack/react-table';
import type { Business } from '@/redux/services/businesses/businesses.api-slice';
import { VendorStatusFilter } from '../molecules/vendor-status-filter';
import { VendorsTable } from '../organisms/vendors-table';

interface VendorsTableTemplateProps {
  vendors: Business[];
  isLoading: boolean;
  isFetching: boolean;
  isSuccess: boolean;
  isError: boolean;
  error?: unknown;
  status: string;
  onStatusChange: (status: string) => void;
  pagination: PaginationState;
  setPagination: OnChangeFn<PaginationState>;
  pageCount: number;
}

export const VendorsTableTemplate = ({
  vendors,
  isLoading,
  isFetching,
  isSuccess,
  isError,
  error,
  status,
  onStatusChange,
  pagination,
  setPagination,
  pageCount,
}: VendorsTableTemplateProps) => {
  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h2 className='text-xl font-bold text-[hsla(210,9%,31%,1)] dark:text-white'>
          Vendors
        </h2>
        <VendorStatusFilter value={status} onChange={onStatusChange} />
      </div>

      <VendorsTable
        data={vendors}
        isLoading={isLoading}
        isFetching={isFetching}
        isSuccess={isSuccess}
        isError={isError}
        error={error}
        pagination={pagination}
        setPagination={setPagination}
        pageCount={pageCount}
      />
    </div>
  );
};

'use client';

import NiceModal from '@ebay/nice-modal-react';
import type { OnChangeFn, PaginationState } from '@tanstack/react-table';
import { WorkInProgressModal } from '@/pattern/common/organisms/work-in-progress-modal';
import { TableToolbar } from '@/pattern/common/molecules/table-toolbar';
import { ClothingProductsTable } from '../organisms/clothing-products-table';
import { ScheduleProductActivationModal } from '../organisms/schedule-product-activation-modal';
import type { ProductAction } from '../molecules/clothing-products-columns';
import type { Product } from '@/redux/services/products/products.api-slice';

interface ClothingProductsTemplateProps {
  products: Product[];
  isLoading: boolean;
  isFetching: boolean;
  isSuccess: boolean;
  isError: boolean;
  error?: unknown;
  search: string;
  onSearchChange: (value: string) => void;
  pagination: PaginationState;
  setPagination: OnChangeFn<PaginationState>;
  pageCount: number;
}

export const ClothingProductsTemplate = ({
  products,
  isLoading,
  isFetching,
  isSuccess,
  isError,
  error,
  search,
  onSearchChange,
  pagination,
  setPagination,
  pageCount,
}: ClothingProductsTemplateProps) => {
  const showWip = () => NiceModal.show(WorkInProgressModal);

  // Schedule activation opens the dedicated date/time modal; the remaining
  // actions are not yet wired to the backend, so they fall back to the shared
  // "Work in Progress" modal for now.
  const handleAction = (action: ProductAction, product: Product) => {
    if (action === 'schedule') {
      NiceModal.show(ScheduleProductActivationModal, { product });
      return;
    }
    showWip();
  };

  return (
    <ClothingProductsTable
      data={products}
      isLoading={isLoading}
      isFetching={isFetching}
      isSuccess={isSuccess}
      isError={isError}
      error={error}
      pagination={pagination}
      setPagination={setPagination}
      pageCount={pageCount}
      onAction={handleAction}
      toolbar={
        <TableToolbar
          title="Clothing"
          search={search}
          onSearchChange={onSearchChange}
          onFilterDate={showWip}
          onExport={showWip}
          filterLabel="Filter By :"
          filterIcon={null}
        />
      }
    />
  );
};

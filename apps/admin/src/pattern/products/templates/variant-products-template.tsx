'use client';

import NiceModal from '@ebay/nice-modal-react';
import type { OnChangeFn, PaginationState } from '@tanstack/react-table';
import { WorkInProgressModal } from '@/pattern/common/organisms/work-in-progress-modal';
import { TableToolbar } from '@/pattern/common/molecules/table-toolbar';
import { VariantProductsTable } from '../organisms/variant-products-table';
import { ScheduleProductActivationModal } from '../organisms/schedule-product-activation-modal';
import type { ProductAction } from '../molecules/product-actions-cell';
import type { Product } from '@/redux/services/products/products.api-slice';

interface VariantProductsTemplateProps {
  /** Toolbar heading, e.g. "Clothing" or "Accessories". */
  title: string;
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
  emptyMessage?: string;
}

// Toolbar + table for any product-with-variants catalogue. Clothing and
// Accessories differ only by the toolbar title and empty-state copy.
export const VariantProductsTemplate = ({
  title,
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
  emptyMessage,
}: VariantProductsTemplateProps) => {
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
    <VariantProductsTable
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
      emptyMessage={emptyMessage}
      toolbar={
        <TableToolbar
          title={title}
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

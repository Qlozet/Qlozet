'use client';

// Customers — mobile list (below `md`)
// The DataTable's five columns don't fit a phone, so each customer renders as
// a card instead: a status-coloured accent bar, the identifier, the order
// count and a full-width action. It reads the same pagination state as the
// DataTable, so the page index survives a resize across the breakpoint.

import React from 'react';
import type { OnChangeFn, PaginationState } from '@tanstack/react-table';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { BoldBoxRemoveIcon } from '@/pattern/common/atoms/bold-box-remove-icon';
import { CustomerAvatar } from '../atoms/customer-avatar';
import {
  formatCount,
  getCustomerIdentifier,
  getCustomerStatus,
  type CustomerStatusVariant,
} from '@/lib/customers';
import type { VendorCustomer } from '@/redux/services/customers/customers.api-slice';
import { readApiError } from '@/redux/services/types';

// The accent bar is the mobile stand-in for the table's Status badge, so it
// uses the same colours those Badge variants resolve to.
const ACCENT_BY_STATUS: Record<CustomerStatusVariant, string> = {
  active: 'bg-[#33CC33]',
  inactive: 'bg-[#E42C66]',
  suspended: 'bg-[#FFB020]',
};

interface CustomersMobileListProps {
  /** The full (filtered) customer list — this component slices the page. */
  customers: VendorCustomer[];
  isLoading?: boolean;
  isFetching?: boolean;
  isError?: boolean;
  error?: unknown;
  pagination: PaginationState;
  setPagination: OnChangeFn<PaginationState>;
  onViewDetails: (customer: VendorCustomer) => void;
  emptyTitle?: string;
  emptyMessage?: string;
}

export const CustomersMobileList: React.FC<CustomersMobileListProps> = ({
  customers,
  isLoading = false,
  isFetching = false,
  isError = false,
  error,
  pagination,
  setPagination,
  onViewDetails,
  emptyTitle = 'Nothing in here yet.',
  emptyMessage,
}) => {
  const { pageIndex, pageSize } = pagination;
  const total = customers.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  // The search can shrink the list under the current page index before the
  // parent's reset effect runs — clamp so we never render an empty page.
  const safeIndex = Math.min(pageIndex, pageCount - 1);
  const start = safeIndex * pageSize;
  const rows = customers.slice(start, start + pageSize);

  const showLoader = isLoading || isFetching;
  const errorMessage = readApiError(error, 'Something went wrong');

  const goToPage = (next: number) =>
    setPagination((prev) => ({ ...prev, pageIndex: next }));

  return (
    <div className="flex flex-1 flex-col md:hidden">
      <div className="flex flex-col gap-2.5 px-3 pb-2 pt-3">
        {/* Loading — mirrors the card layout rather than a spinner */}
        {showLoader &&
          Array.from({ length: pageSize || 5 }).map((_, index) => (
            <div
              key={`skeleton-${index}`}
              className="flex overflow-hidden rounded-lg border border-border bg-card"
            >
              <span className="w-1 shrink-0 bg-muted" />
              <div className="flex-1 space-y-3 p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="size-8 shrink-0 rounded-full" />
                  <Skeleton className="h-4 w-36" />
                </div>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-8" />
                </div>
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            </div>
          ))}

        {!showLoader &&
          !isError &&
          rows.map((customer) => {
            const status = getCustomerStatus(customer);
            return (
              <div
                key={customer._id}
                onClick={() => onViewDetails(customer)}
                className="flex cursor-pointer overflow-hidden rounded-lg border border-border bg-card"
              >
                <span
                  aria-hidden
                  className={cn(
                    'w-1 shrink-0',
                    ACCENT_BY_STATUS[status.variant]
                  )}
                />
                <div className="flex-1 space-y-3 p-4">
                  <div className="flex items-center gap-3">
                    <CustomerAvatar customer={customer} size="sm" />
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                      {getCustomerIdentifier(customer)}
                    </p>
                    {/* The accent bar carries the status visually; give screen
                        readers the same information in words. */}
                    <span className="sr-only">Status: {status.label}</span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-grey3">Total Orders</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatCount(customer.total_orders)}
                    </span>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={(e) => {
                      // The card itself is tappable — don't open twice.
                      e.stopPropagation();
                      onViewDetails(customer);
                    }}
                    className="h-11 w-full cursor-pointer text-sm font-normal dark:border-gray-500"
                  >
                    View Customer
                  </Button>
                </div>
              </div>
            );
          })}

        {/* Empty state — same copy and icon as the DataTable's */}
        {!showLoader && !isError && total === 0 && (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <BoldBoxRemoveIcon />
            <div className="flex flex-col items-center gap-2">
              <p className="text-base font-medium text-muted-foreground">
                {emptyTitle}
              </p>
              {emptyMessage && (
                <p className="text-sm text-muted-foreground">{emptyMessage}</p>
              )}
            </div>
          </div>
        )}

        {!showLoader && isError && (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <p className="text-base font-medium text-destructive">
              Error loading customers
            </p>
            <p className="text-sm text-muted-foreground">{errorMessage}</p>
          </div>
        )}
      </div>

      {/* Pagination — matches the table footer's wording, centred on mobile */}
      {!showLoader && !isError && total > 0 && (
        <div className="mt-auto flex w-full items-center justify-center gap-x-4 py-4">
          <div className="text-sm text-muted-foreground">
            Showing {start + 1} - {Math.min(start + pageSize, total)} of {total}
          </div>

          <Button
            className="h-6 w-6 cursor-pointer rounded-full dark:border-gray-500"
            variant="outline"
            size="icon"
            aria-label="Previous page"
            onClick={() => goToPage(safeIndex - 1)}
            disabled={safeIndex <= 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            className="h-6 w-6 cursor-pointer rounded-full dark:border-gray-500"
            variant="outline"
            size="icon"
            aria-label="Next page"
            onClick={() => goToPage(safeIndex + 1)}
            disabled={safeIndex >= pageCount - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

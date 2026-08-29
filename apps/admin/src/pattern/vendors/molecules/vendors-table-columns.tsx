'use client';

import Image from 'next/image';
import { ColumnDef } from '@tanstack/react-table';
import {
  Eye,
  CheckCircle2,
  BadgeCheck,
  XCircle,
  RotateCcw,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  RowActionsMenu,
  type RowAction,
} from '@/pattern/common/molecules/row-actions-menu';
import type { Business } from '@/redux/services/businesses/businesses.api-slice';
import {
  getVendorName,
  getVendorEmail,
  getVendorInitial,
  getVendorLogo,
  getVendorStatus,
  formatCount,
  formatNaira,
  formatOnboardedDate,
  type VendorStatusVariant,
} from '@/lib/vendors';

// Map the vendor status to the shared Badge variants (mirrors how the vendor
// app derives status badge variants in its table columns).
const STATUS_BADGE_VARIANT: Record<
  VendorStatusVariant,
  'success' | 'warning' | 'error'
> = {
  active: 'success',
  awaiting: 'warning',
  inactive: 'error',
};

/** Columns the endpoint can order by. */
export type VendorSortColumn =
  | 'revenue'
  | 'products'
  | 'orders'
  | 'date'
  | 'name';

interface SortableHeaderProps {
  label: string;
  column: VendorSortColumn;
  sort?: VendorSortColumn;
  order?: 'asc' | 'desc';
  onToggle: (column: VendorSortColumn) => void;
}

/**
 * A column header that sorts server-side.
 *
 * Sorting has to be the server's job here: products, orders and revenue are
 * computed per row, and the page on screen is not enough to order the whole
 * table by any of them.
 */
const SortableHeader = ({
  label,
  column,
  sort,
  order,
  onToggle,
}: SortableHeaderProps) => {
  const active = sort === column;
  const direction = active ? order : undefined;

  return (
    <button
      type="button"
      onClick={() => onToggle(column)}
      className="flex items-center gap-1 text-inherit transition-colors hover:text-foreground"
      aria-label={
        direction
          ? `${label}, sorted ${direction === 'asc' ? 'ascending' : 'descending'}`
          : `Sort by ${label.toLowerCase()}`
      }
    >
      {label}
      {direction === 'asc' ? (
        <ArrowUp className="size-3.5" />
      ) : direction === 'desc' ? (
        <ArrowDown className="size-3.5" />
      ) : (
        <ArrowUpDown className="size-3.5 opacity-40" />
      )}
    </button>
  );
};

interface VendorsTableColumnsProps {
  onViewDetails: (vendorId: string) => void;
  onApprove: (vendorId: string) => void;
  onVerify: (vendorId: string) => void;
  onReject: (vendorId: string) => void;
  onSetInReview: (vendorId: string) => void;
  /** Disables the state-changing items while a mutation is in flight. */
  isUpdating?: boolean;
  /** Column currently sorted, or undefined for the endpoint's default order. */
  sort?: VendorSortColumn;
  order?: 'asc' | 'desc';
  /** Cycles that column desc -> asc -> off. */
  onToggleSort: (column: VendorSortColumn) => void;
}

export const createVendorsTableColumns = ({
  onViewDetails,
  onApprove,
  onVerify,
  onReject,
  onSetInReview,
  isUpdating,
  sort,
  order,
  onToggleSort,
}: VendorsTableColumnsProps): ColumnDef<Business>[] => [
  {
    id: 'name',
    header: () => (
      <SortableHeader
        label="Vendor's name"
        column="name"
        sort={sort}
        order={order}
        onToggle={onToggleSort}
      />
    ),
    cell: ({ row }) => {
      const vendor = row.original;
      const name = getVendorName(vendor);
      const logo = getVendorLogo(vendor);

      return (
        <div className="flex items-center gap-3">
          {/* The logo when the vendor has uploaded one; the initial is the
              fallback, not the default. `unoptimized` because these are
              arbitrary Cloudinary URLs the image config does not whitelist. */}
          <span className="relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 dark:bg-gray-400 text-xs font-semibold text-primary">
            {logo ? (
              <Image
                src={logo}
                alt={name}
                fill
                sizes="32px"
                className="object-cover"
                unoptimized
              />
            ) : (
              getVendorInitial(vendor)
            )}
          </span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {name}
          </span>
        </div>
      );
    },
    enableSorting: false,
  },
  {
    id: 'email',
    header: 'Email Address',
    cell: ({ row }) => (
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {getVendorEmail(row.original)}
      </div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'createdAt',
    header: () => (
      <SortableHeader
        label="Date onboarded"
        column="date"
        sort={sort}
        order={order}
        onToggle={onToggleSort}
      />
    ),
    cell: ({ row }) => (
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {formatOnboardedDate(row.original.createdAt)}
      </div>
    ),
    enableSorting: false,
  },
  {
    id: 'products',
    header: () => (
      <SortableHeader
        label="Products"
        column="products"
        sort={sort}
        order={order}
        onToggle={onToggleSort}
      />
    ),
    cell: ({ row }) => (
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {formatCount(row.original.total_products)}
      </div>
    ),
    enableSorting: false,
  },
  {
    id: 'orders',
    header: () => (
      <SortableHeader
        label="Orders"
        column="orders"
        sort={sort}
        order={order}
        onToggle={onToggleSort}
      />
    ),
    cell: ({ row }) => (
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {formatCount(row.original.total_orders)}
      </div>
    ),
    enableSorting: false,
  },
  {
    id: 'revenue',
    header: () => (
      <SortableHeader
        label="Revenue"
        column="revenue"
        sort={sort}
        order={order}
        onToggle={onToggleSort}
      />
    ),
    cell: ({ row }) => (
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {formatNaira(row.original.total_revenue)}
      </div>
    ),
    enableSorting: false,
  },
  {
    id: 'status',
    header: "Vendor's status",
    cell: ({ row }) => {
      const status = getVendorStatus(row.original);
      return (
        <Badge
          variant={STATUS_BADGE_VARIANT[status.variant]}
          shape="square"
          className="h-[26px] flex w-fit items-center justify-center px-3 text-xs font-normal"
        >
          {status.label}
        </Badge>
      );
    },
    enableSorting: false,
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => {
      const vendor = row.original;
      const status = (vendor.status ?? '').toString().toLowerCase();

      // Only offer the transitions that would actually change something.
      // "Approve" on an approved vendor is a no-op the admin has to reason
      // about, and it makes the menu look like it did nothing.
      const actions: RowAction[] = [
        {
          label: 'View details',
          onSelect: () => onViewDetails(vendor._id),
        },
      ];

      if (status !== 'approved' && status !== 'verified') {
        actions.push({
          label: 'Approve',
          disabled: isUpdating,
          onSelect: () => onApprove(vendor._id),
        });
      }
      if (status !== 'verified') {
        actions.push({
          label: 'Verify',
          disabled: isUpdating,
          onSelect: () => onVerify(vendor._id),
        });
      }
      if (status !== 'in-review' && status !== 'pending') {
        // The mutation already existed and was wired on the detail page; the
        // table never offered it, so sending a vendor back for review meant
        // opening their page first.
        actions.push({
          label: 'Send to review',
          disabled: isUpdating,
          onSelect: () => onSetInReview(vendor._id),
        });
      }
      if (status !== 'rejected') {
        actions.push({
          label: 'Reject',
          destructive: true,
          disabled: isUpdating,
          onSelect: () => onReject(vendor._id),
        });
      }

      return (
        <RowActionsMenu
          title="Vendor actions"
          triggerLabel={`Actions for ${getVendorName(vendor)}`}
          actions={actions}
        />
      );
    },
    enableSorting: false,
  },
];

'use client';

import Image from 'next/image';
import { ColumnDef } from '@tanstack/react-table';
import {
  MoreHorizontal,
  Eye,
  CheckCircle2,
  BadgeCheck,
  XCircle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

interface VendorsTableColumnsProps {
  onViewDetails: (vendorId: string) => void;
  onApprove: (vendorId: string) => void;
  onVerify: (vendorId: string) => void;
  onReject: (vendorId: string) => void;
  /** Current revenue sort, or undefined when the table is in its default order. */
  revenueSort?: 'asc' | 'desc';
  /** Cycles desc -> asc -> off. */
  onToggleRevenueSort: () => void;
}

export const createVendorsTableColumns = ({
  onViewDetails,
  onApprove,
  onVerify,
  onReject,
  revenueSort,
  onToggleRevenueSort,
}: VendorsTableColumnsProps): ColumnDef<Business>[] => [
  {
    id: 'name',
    header: "Vendor's name",
    cell: ({ row }) => {
      const vendor = row.original;
      const name = getVendorName(vendor);
      const logo = getVendorLogo(vendor);

      return (
        <div className="flex items-center gap-3">
          {/* The logo when the vendor has uploaded one; the initial is the
              fallback, not the default. `unoptimized` because these are
              arbitrary Cloudinary URLs the image config does not whitelist. */}
          <span className="relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-xs font-semibold text-primary">
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
    header: 'Date onboarded',
    cell: ({ row }) => (
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {formatOnboardedDate(row.original.createdAt)}
      </div>
    ),
    enableSorting: false,
  },
  {
    id: 'products',
    header: 'Products',
    cell: ({ row }) => (
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {formatCount(row.original.total_products)}
      </div>
    ),
    enableSorting: false,
  },
  {
    id: 'orders',
    header: 'Orders',
    cell: ({ row }) => (
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {formatCount(row.original.total_orders)}
      </div>
    ),
    enableSorting: false,
  },
  {
    id: 'revenue',
    // Sorted server-side: revenue is a computed column, so the page being shown
    // is not enough to order the whole table by it.
    header: () => (
      <button
        type="button"
        onClick={onToggleRevenueSort}
        className="flex items-center gap-1 text-inherit transition-colors hover:text-foreground"
        aria-label={
          revenueSort
            ? `Revenue, sorted ${revenueSort === 'asc' ? 'ascending' : 'descending'}`
            : 'Sort by revenue'
        }
      >
        Revenue
        {revenueSort === 'asc' ? (
          <ArrowUp className="size-3.5" />
        ) : revenueSort === 'desc' ? (
          <ArrowDown className="size-3.5" />
        ) : (
          <ArrowUpDown className="size-3.5 opacity-40" />
        )}
      </button>
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
      const vendorId = row.original._id;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Vendor actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onViewDetails(vendorId)}>
              <Eye className="size-4" /> View details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onApprove(vendorId)}>
              <CheckCircle2 className="size-4" /> Approve
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onVerify(vendorId)}>
              <BadgeCheck className="size-4" /> Verify
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onReject(vendorId)}
              className="text-destructive"
            >
              <XCircle className="size-4" /> Reject
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    enableSorting: false,
  },
];

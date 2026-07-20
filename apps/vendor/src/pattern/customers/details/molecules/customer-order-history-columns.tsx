'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { CustomerOrderPreview } from '@/redux/services/customers/customers.api-slice';

// ──────────────── Helpers ────────────────

const formatNaira = (value?: number): string =>
  typeof value === 'number' && !Number.isNaN(value)
    ? `₦${value.toLocaleString()}`
    : '—';

const formatDate = (iso?: string): string => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const shortRef = (ref?: string): string =>
  ref ? `#${ref.slice(-6).toUpperCase()}` : '—';

// Status badge — same palette as the orders table (order-fields.ts)
type OrderStatus = CustomerOrderPreview['status'];

interface StatusBadge {
  label: string;
  className: string;
}

const statusBadge = (status?: OrderStatus): StatusBadge => {
  const map: Record<string, StatusBadge> = {
    pending: {
      label: 'Pending',
      className: 'bg-[#FEF6E7] text-[#DD900D]',
    },
    in_review: {
      label: 'In Review',
      className: 'bg-[#E7F0FA] text-[#3387CC]',
    },
    processing: {
      label: 'Processing',
      className: 'bg-[#F4EBFF] text-[#7E22CE]',
    },
    in_transit: {
      label: 'In Transit',
      className: 'bg-[#EAECF0] text-[#475467]',
    },
    completed: {
      label: 'Completed',
      className: 'bg-[#E7F6EC] text-[#0F973D]',
    },
    cancelled: {
      label: 'Cancelled',
      className: 'bg-[#FBEAE9] text-[#D42620]',
    },
    returned: {
      label: 'Returned',
      className: 'bg-[#FEECEB] text-[#D42620]',
    },
  };
  return (
    map[status ?? ''] ?? {
      label: status
        ? status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ')
        : '—',
      className: 'bg-[#EAECF0] text-[#475467]',
    }
  );
};

// ──────────────── Columns ────────────────

export const createOrderHistoryColumns = (
  onViewOrder: (order: CustomerOrderPreview) => void
): ColumnDef<CustomerOrderPreview>[] => [
  {
    id: 'order_id',
    header: 'Order ID',
    cell: ({ row }) => (
      <span className='whitespace-nowrap text-sm font-medium text-grey-black dark:text-foreground'>
        {shortRef(row.original.reference)}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: 'date',
    header: 'Date',
    cell: ({ row }) => (
      <span className='whitespace-nowrap text-sm text-gray-600 dark:text-muted-foreground'>
        {formatDate(row.original.createdAt)}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: 'amount_paid',
    header: 'Amount paid',
    cell: ({ row }) => (
      <span className='whitespace-nowrap text-sm text-gray-600 dark:text-muted-foreground'>
        {formatNaira(row.original.total)}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const badge = statusBadge(row.original.status);
      return (
        <span
          className={cn(
            'inline-flex h-[26px] items-center justify-center whitespace-nowrap rounded-[8px] px-3 text-xs font-medium',
            badge.className
          )}
        >
          {badge.label}
        </span>
      );
    },
    enableSorting: false,
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => (
      <Button
        type='button'
        variant='outline'
        size='sm'
        onClick={() => onViewOrder(row.original)}
        className='text-xs'
      >
        View Details
      </Button>
    ),
    enableSorting: false,
  },
];

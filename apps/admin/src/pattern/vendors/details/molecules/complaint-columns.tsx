'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ShoppingBag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { VendorComplaint } from '@/redux/services/vendor-details/vendor-details.api-slice';

const ICON_BG = [
  'bg-[#B42318]',
  'bg-[#E8A87C]',
  'bg-[#8B5CF6]',
  'bg-[#3387CC]',
  'bg-[#1A1A1A]',
  'bg-gray-400',
];

const statusVariant = (status?: string): 'success' | 'warning' | 'error' => {
  const s = (status ?? '').toLowerCase();
  if (['resolved', 'closed', 'completed'].includes(s)) return 'success';
  if (['rejected', 'failed'].includes(s)) return 'error';
  return 'warning';
};

const statusLabel = (status?: string): string => {
  if (!status) return 'Pending';
  return status.charAt(0).toUpperCase() + status.slice(1);
};

interface ComplaintColumnsProps {
  onViewDetails: (id: string) => void;
}

export const createComplaintColumns = ({
  onViewDetails,
}: ComplaintColumnsProps): ColumnDef<VendorComplaint>[] => [
  {
    id: 'complaint',
    header: 'Complaint',
    cell: ({ row, table }) => {
      const c = row.original;
      const index = table
        .getRowModel()
        .rows.findIndex((r) => r.id === row.id);
      return (
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'flex size-9 shrink-0 items-center justify-center rounded-full text-white',
              ICON_BG[index % ICON_BG.length]
            )}
          >
            <ShoppingBag className="size-4" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-[hsla(210,9%,31%,1)]">
              {c.reference ?? c.ticket_id ?? '—'}
            </span>
            <span className="text-xs text-gray-500">
              {c.title ?? c.subject ?? 'Issue'}
            </span>
            <span className="max-w-[420px] text-xs text-gray-500">
              {c.description ?? c.message ?? ''}
            </span>
          </div>
        </div>
      );
    },
    enableSorting: false,
  },
  {
    id: 'date',
    header: 'Date',
    cell: ({ row }) => (
      <span className="text-sm text-gray-600 whitespace-nowrap">
        {row.original.date ?? row.original.createdAt ?? '—'}
      </span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Badge
        variant={statusVariant(row.original.status)}
        shape="square"
        className="flex h-[26px] w-fit items-center justify-center px-3 text-xs font-normal"
      >
        {statusLabel(row.original.status)}
      </Badge>
    ),
    enableSorting: false,
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onViewDetails(row.original._id)}
        className="h-9 text-sm"
      >
        View details
      </Button>
    ),
    enableSorting: false,
  },
];

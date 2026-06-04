'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { VendorActivity } from '@/redux/services/vendor-details/vendor-details.api-slice';

const statusVariant = (
  status?: string
): 'success' | 'warning' | 'error' => {
  const s = (status ?? '').toLowerCase();
  if (['successful', 'success', 'completed'].includes(s)) return 'success';
  if (['failed', 'declined'].includes(s)) return 'error';
  return 'warning';
};

const statusLabel = (status?: string): string => {
  if (!status) return 'Pending';
  return status.charAt(0).toUpperCase() + status.slice(1);
};

export const createActivityLogColumns = (): ColumnDef<VendorActivity>[] => [
  {
    id: 'date',
    header: 'Date',
    cell: ({ row }) => (
      <span className="text-sm text-gray-700 whitespace-nowrap">
        {row.original.date ?? row.original.createdAt ?? '—'}
      </span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'user',
    header: 'User',
    cell: ({ row }) => (
      <span className="text-sm text-gray-700 whitespace-nowrap">
        {row.original.user ?? '—'}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: 'activityType',
    header: 'Activity Type',
    cell: ({ row }) => (
      <span className="text-sm text-gray-700 whitespace-nowrap">
        {row.original.activityType ?? row.original.type ?? '—'}
      </span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => (
      <span className="block max-w-[160px] text-sm text-gray-700 line-clamp-2">
        {row.original.description ?? '—'}
      </span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) => (
      <span className="text-sm text-gray-700 whitespace-nowrap">
        {typeof row.original.amount === 'number'
          ? `$${row.original.amount.toLocaleString()}`
          : '—'}
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
    accessorKey: 'remarks',
    header: 'Remarks',
    cell: ({ row }) => (
      <span className="block max-w-[160px] text-sm text-gray-700 line-clamp-2">
        {row.original.remarks ?? '—'}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: 'actions',
    header: '',
    cell: () => (
      <ChevronRight className="size-5 text-gray-400" />
    ),
    enableSorting: false,
  },
];

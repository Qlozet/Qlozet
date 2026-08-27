'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Gavel } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Dispute } from '@/redux/services/disputes/disputes.api-slice';
import {
  REASON_LABELS,
  STATUS_META,
  customerName,
  vendorName,
  formatDate,
  isActionable,
} from '../lib/dispute-labels';

export interface DisputesColumnActions {
  onResolve: (dispute: Dispute) => void;
}

export function createDisputesColumns(
  actions: DisputesColumnActions
): ColumnDef<Dispute>[] {
  return [
    {
      accessorKey: 'order_reference',
      header: 'Order',
      cell: ({ row }) => (
        <span className="font-medium text-gray-800 dark:text-gray-100">
          {row.original.order_reference}
        </span>
      ),
    },
    {
      id: 'customer',
      header: 'Customer',
      cell: ({ row }) => (
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {customerName(row.original.customer)}
        </span>
      ),
    },
    {
      id: 'vendor',
      header: 'Vendor',
      cell: ({ row }) => (
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {vendorName(row.original.business)}
        </span>
      ),
    },
    {
      id: 'reason',
      header: 'Reason',
      cell: ({ row }) => (
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {REASON_LABELS[row.original.reason] ?? row.original.reason}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const meta = STATUS_META[row.original.status] ?? {
          label: row.original.status,
          variant: 'secondary' as const,
        };
        return <Badge variant={meta.variant}>{meta.label}</Badge>;
      },
    },
    {
      id: 'filed',
      header: 'Filed',
      cell: ({ row }) => (
        <span className="text-sm text-gray-500">
          {formatDate(row.original.createdAt)}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const d = row.original;
        const actionable = isActionable(d.status);
        return (
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={() => actions.onResolve(d)}
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
            >
              <Gavel className="size-4" />
              {actionable ? 'Resolve' : 'View'}
            </button>
          </div>
        );
      },
    },
  ];
}

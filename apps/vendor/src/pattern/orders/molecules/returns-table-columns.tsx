'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ReturnRequest } from '@/redux/services/returns/returns.api-slice';
import { formatDate, formatNaira } from '../lib/order-fields';
import {
  canDecideReturn,
  canMarkReceived,
  readReturnCustomer,
  readReturnReason,
  readReturnRef,
  readReturnStatus,
  returnStatusBadge,
} from '../lib/return-fields';

export interface ReturnsColumnActions {
  onApprove: (r: ReturnRequest) => void;
  onReject: (r: ReturnRequest) => void;
  onReceived: (r: ReturnRequest) => void;
  /** _id of the row whose mutation is in flight (disables its buttons). */
  busyId?: string | null;
}

export const createReturnsColumns = (
  actions: ReturnsColumnActions
): ColumnDef<ReturnRequest>[] => [
  {
    id: 'date',
    header: 'Date',
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm text-gray-600 dark:text-muted-foreground">
        {formatDate(row.original.createdAt)}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: 'order',
    header: 'Order',
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm font-medium text-grey-black dark:text-foreground">
        {readReturnRef(row.original)}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: 'customer',
    header: 'Customer',
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm text-gray-600 dark:text-muted-foreground">
        {readReturnCustomer(row.original)}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: 'reason',
    header: 'Reason',
    // The reason, the customer's own words, and their photos: what the
    // vendor needs to decide. Words and photos were stored but never shown.
    cell: ({ row }) => {
      const r = row.original;
      const photos = (r.evidence_urls ?? []).filter(Boolean);
      return (
        <div className="flex max-w-[260px] flex-col gap-1">
          <span className="text-sm font-medium text-grey-black dark:text-foreground">
            {readReturnReason(r)}
          </span>
          {r.description ? (
            <span
              className="line-clamp-2 text-xs text-gray-600 dark:text-muted-foreground"
              title={r.description}
            >
              {r.description}
            </span>
          ) : null}
          {photos.length > 0 && (
            <div className="flex gap-1">
              {photos.slice(0, 3).map((url, i) => (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Customer photo ${i + 1}`}
                  className="block size-9 overflow-hidden rounded-md border"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="size-full object-cover" />
                </a>
              ))}
            </div>
          )}
          {r.vendor_rejection_reason ? (
            <span className="text-xs text-[#D42620]">
              You said: {r.vendor_rejection_reason}
            </span>
          ) : null}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    id: 'refund',
    header: 'Refund',
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm text-gray-600 dark:text-muted-foreground">
        {typeof row.original.refund_amount === 'number'
          ? formatNaira(row.original.refund_amount)
          : '—'}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const badge = returnStatusBadge(readReturnStatus(row.original));
      return (
        <span
          className={cn(
            'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
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
    header: 'Actions',
    cell: ({ row }) => {
      const r = row.original;
      const status = readReturnStatus(r);
      const busy = actions.busyId === r._id;

      // requested -> approve / reject ; approved -> mark received ; else nothing.
      if (canDecideReturn(status)) {
        return (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="h-8 bg-[#0F973D] text-white hover:bg-[#0F973D]/90"
              disabled={busy}
              onClick={() => actions.onApprove(r)}
            >
              {busy ? <Loader2 className="size-3.5 animate-spin" /> : 'Approve'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-[#D42620] border-[#D42620]/40 hover:bg-[#FBEAE9]"
              disabled={busy}
              onClick={() => actions.onReject(r)}
            >
              Reject
            </Button>
          </div>
        );
      }

      if (canMarkReceived(status)) {
        return (
          <Button
            size="sm"
            variant="outline"
            className="h-8"
            disabled={busy}
            onClick={() => actions.onReceived(r)}
          >
            {busy ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              'Mark received'
            )}
          </Button>
        );
      }

      return <span className="text-sm text-gray-400">—</span>;
    },
    enableSorting: false,
  },
];

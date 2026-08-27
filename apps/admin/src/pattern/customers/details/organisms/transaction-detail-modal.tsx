'use client';

// Transaction detail modal.
//
// There is no per-transaction endpoint on the backend, so this renders the
// record the list already returned — every field shown comes straight off that
// row, and anything the record doesn't carry is simply omitted rather than
// filled in with a placeholder.

import { create, useModal } from '@ebay/nice-modal-react';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/customers';
import type { Transaction } from '@/redux/services/transactions/transactions.api-slice';

interface TransactionDetailModalProps {
  transaction: Transaction;
}

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'error'> = {
  successful: 'success',
  success: 'success',
  completed: 'success',
  pending: 'warning',
  processing: 'warning',
  failed: 'error',
  declined: 'error',
};

const Row = ({ label, value }: { label: string; value?: React.ReactNode }) =>
  value === undefined || value === null || value === '' ? null : (
    <div className="flex items-start justify-between gap-4 border-b border-border py-2.5 last:border-b-0">
      <span className="shrink-0 text-xs text-grey3 dark:text-gray-400">
        {label}
      </span>
      <span className="break-all text-right text-sm font-medium text-grey-black dark:text-white">
        {value}
      </span>
    </div>
  );

export const TransactionDetailModal = create<TransactionDetailModalProps>(
  ({ transaction }) => {
    const modal = useModal();

    if (!modal.visible) return null;

    const close = () => modal.remove();

    const status = (transaction.status ?? '').toLowerCase();
    const amount =
      typeof transaction.amount === 'number' &&
      !Number.isNaN(transaction.amount)
        ? `${transaction.currency || 'NGN'} ${transaction.amount.toLocaleString()}`
        : undefined;

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={close}
        />

        <div
          role="dialog"
          aria-modal="true"
          aria-label="Transaction details"
          className="relative z-10 w-full max-w-md rounded-2xl bg-white dark:bg-card p-6 shadow-2xl"
        >
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-grey-black dark:text-white">
                Transaction
              </h2>
              {status && (
                <Badge
                  variant={STATUS_VARIANT[status] ?? 'warning'}
                  shape="square"
                  className="mt-1 flex h-[24px] w-fit items-center px-3 text-xs font-normal"
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Badge>
              )}
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-grey3 dark:text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-muted/80"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            <Row label="Amount" value={amount} />
            <Row
              label="Reference"
              value={transaction.transactionId || transaction.reference}
            />
            <Row label="Type" value={transaction.type} />
            <Row
              label="Narration"
              value={transaction.narration || transaction.description}
            />
            <Row label="Date" value={formatDate(transaction.createdAt)} />
            <Row label="Transaction ID" value={transaction._id} />
          </div>
        </div>
      </div>
    );
  }
);

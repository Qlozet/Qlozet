'use client';

// Transaction Details Modal - Organism
// Read-only breakdown of a single wallet transaction, opened from the
// "View Details" action on the Recent Transactions table.

import { ReactNode } from 'react';
import { create, useModal } from '@ebay/nice-modal-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { OverlayScroll } from '@/components/OverlayScroll';
import {
  formatDate,
  formatNaira,
  readAmount,
  readChannel,
  readNarration,
  readStatus,
  readTransactionDate,
  readTransactionId,
  readTransactionType,
  transactionBadge,
  transactionTypeBadge,
  type TransactionRow,
} from '../lib/transaction-fields';

interface TransactionDetailsModalProps {
  transaction: TransactionRow;
}

const DetailRow = ({ label, value }: { label: string; value: ReactNode }) => (
  <div className="flex items-center justify-between gap-3 border-b border-[#DDE2E5] dark:border-border px-4 py-3 last:border-b-0 sm:gap-4 sm:px-5 sm:py-4">
    <span className="shrink-0 text-sm text-grey-black dark:text-gray-400">
      {label}
    </span>
    {/* Values like the transaction ID are long — let them wrap rather than
        force the dialog wider than the viewport. */}
    <span className="min-w-0 wrap-break-word text-right text-sm text-[#333333] dark:text-white">
      {value}
    </span>
  </div>
);

export const TransactionDetailsModal = create<TransactionDetailsModalProps>(
  ({ transaction }) => {
    const { visible, resolve, remove } = useModal();

    const handleClose = () => {
      resolve({ resolved: true });
      remove();
    };

    const badge = transactionBadge(readStatus(transaction));
    const typeBadge = transactionTypeBadge(readTransactionType(transaction));

    return (
      <Dialog open={visible} onOpenChange={handleClose}>
        <DialogContent className="bg-card flex max-h-[90vh] max-w-xl flex-col overflow-hidden p-4 sm:p-6">
          <DialogHeader className="shrink-0 border-b border-dashed dark:border-border pb-3 text-left mb-4">
            <DialogTitle className="text-lg font-medium text-[#000000] dark:text-white">
              Transaction details
            </DialogTitle>
          </DialogHeader>

          <OverlayScroll className="min-h-0 flex-1 pr-1">
            <div className="bg-[#F7F7F7F8] dark:bg-[#404040] dark:border dark:border-border rounded-[20px]">
              <DetailRow
                label="Transaction ID"
                value={readTransactionId(transaction)}
              />
              <DetailRow
                label="Amount"
                value={formatNaira(readAmount(transaction))}
              />
              <DetailRow
                label="Date"
                value={formatDate(readTransactionDate(transaction))}
              />
              <DetailRow
                label="Transaction type"
                value={
                  <span
                    className={cn(
                      'inline-flex h-6.5 items-center justify-center whitespace-nowrap rounded-lg px-3 text-xs font-medium',
                      typeBadge.className
                    )}
                  >
                    {typeBadge.label}
                  </span>
                }
              />
              <DetailRow label="Channel" value={readChannel(transaction)} />
              <DetailRow label="Narration" value={readNarration(transaction)} />
              <DetailRow
                label="Status"
                value={
                  <span
                    className={cn(
                      'inline-flex h-6.5 items-center justify-center whitespace-nowrap rounded-lg px-3 text-xs font-medium',
                      badge.className
                    )}
                  >
                    {badge.label}
                  </span>
                }
              />
            </div>
          </OverlayScroll>

          <div className="flex shrink-0 justify-end mt-5.75">
            <Button type="button" onClick={handleClose} className="min-w-32">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);

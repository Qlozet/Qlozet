'use client';

// Transaction Details Modal - Organism
// Read-only breakdown of a single wallet transaction, opened from the
// "View Details" action on the Recent Transactions table.

import React, { ReactNode } from 'react';
import { create, useModal } from '@ebay/nice-modal-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  formatDate,
  formatNaira,
  readAmount,
  readBalanceAfter,
  readBalanceBefore,
  readNarration,
  readSender,
  readSenderAccount,
  readStatus,
  readTransactionDate,
  readTransactionId,
  readTransactionType,
  transactionBadge,
  type TransactionRow,
} from '../lib/transaction-fields';

interface TransactionDetailsModalProps {
  transaction: TransactionRow;
}

const DetailRow = ({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) => (
  <div className='flex items-center justify-between gap-4 border-b border-[#DDE2E5] px-5 py-4 last:border-b-0'>
    <span className='text-sm text-grey-black'>{label}</span>
    <span className='text-right text-sm text-[#333333]'>{value}</span>
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

    return (
      <Dialog open={visible} onOpenChange={handleClose}>
        <DialogContent className='bg-white! flex max-h-[85vh] max-w-xl flex-col overflow-hidden p-6'>
          <DialogHeader className='shrink-0 border-b border-dashed pb-3 text-left mb-4'>
            <DialogTitle className='text-lg font-medium text-[#000000]'>
              Transaction details
            </DialogTitle>
          </DialogHeader>

          <div className='min-h-0 flex-1 overflow-y-auto pr-1'>
            <div className='bg-[#F7F7F7F8] rounded-[20px]'>
            <DetailRow
              label='Transaction ID'
              value={readTransactionId(transaction)}
            />
            <DetailRow label='Amount' value={formatNaira(readAmount(transaction))} />
            <DetailRow
              label='Date'
              value={formatDate(readTransactionDate(transaction))}
            />
            <DetailRow
              label='Transaction type'
              value={readTransactionType(transaction)}
            />
            <DetailRow label='Sender' value={readSender(transaction)} />
            <DetailRow
              label='Sender account/bank'
              value={readSenderAccount(transaction)}
            />
            <DetailRow label='Narration' value={readNarration(transaction)} />
            <DetailRow
              label='Balance before'
              value={formatNaira(readBalanceBefore(transaction))}
            />
            <DetailRow
              label='Balance after'
              value={formatNaira(readBalanceAfter(transaction))}
            />
            <DetailRow
              label='Status'
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
          </div>

          <div className='flex shrink-0 justify-end mt-5.75'>
            <Button type='button' onClick={handleClose} className='min-w-32'>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);

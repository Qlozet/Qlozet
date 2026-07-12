'use client';

// Fund With Bank Modal - Organism
// Shows the vendor's deposit account details to copy for funding by bank
// transfer. Opened from the Fund wallet chooser → "Fund Account with Bank".
// TODO(api): the backend exposes no deposit/virtual-account endpoint yet, so
// these details are placeholders.

import React from 'react';
import { create, useModal } from '@ebay/nice-modal-react';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

// TODO(api): source from the vendor's real deposit account once available.
const DEPOSIT_ACCOUNT = {
  accountNumber: '3123456789',
  bank: 'First bank of Nigeria',
  accountName: 'Johnson Hope',
};

const DetailField = ({
  label,
  value,
  onCopy,
}: {
  label: string;
  value: string;
  onCopy?: () => void;
}) => (
  <div className='space-y-1.5'>
    <label className='text-sm font-medium text-[#333333] dark:text-gray-300'>{label}</label>
    <div className='flex h-12 items-center justify-between gap-3 rounded-lg bg-[#EDEFF2] dark:bg-[#404040] px-4'>
      <span className='truncate text-sm font-semibold text-[#1A1A1A] dark:text-white'>
        {value}
      </span>
      {onCopy ? (
        <button
          type='button'
          onClick={onCopy}
          aria-label={`Copy ${label.toLowerCase()}`}
          className='shrink-0 cursor-pointer text-[#646A86] dark:text-gray-400 transition hover:text-[#1A1A1A] dark:text-white'
        >
          <Copy className='size-5' />
        </button>
      ) : null}
    </div>
  </div>
);

export const FundWithBankModal = create(() => {
  const { visible, resolve, remove } = useModal();

  const handleClose = () => {
    resolve({ resolved: true });
    remove();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(DEPOSIT_ACCOUNT.accountNumber);
      toast.success('Account number copied');
    } catch {
      toast.error('Could not copy the account number.');
    }
  };

  return (
    <Dialog open={visible} onOpenChange={handleClose}>
      <DialogContent className='max-w-md p-6 bg-card'>
        <DialogHeader className='border-b border-dashed dark:border-border pb-3 text-left mb-4'>
          <DialogTitle className='text-base font-medium text-[#0C0C0D] dark:text-white'>
            Send Money
          </DialogTitle>
        </DialogHeader>

        <p className='text-sm font-normal text-[#0C0C0D] dark:text-white mb-4'>
          Copy the account details below to send funds to your wallet
        </p>

        <div className='space-y-4'>
          <DetailField
            label='Account number'
            value={DEPOSIT_ACCOUNT.accountNumber}
            onCopy={handleCopy}
          />
          <DetailField label='Bank' value={DEPOSIT_ACCOUNT.bank} />
          <DetailField label='Account name' value={DEPOSIT_ACCOUNT.accountName} />
        </div>

        <div className='pt-6'>
          <Button type='button' onClick={handleClose} className='min-w-[10rem]'>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
});


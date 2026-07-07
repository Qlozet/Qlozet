'use client';

// Send Money Modal - Organism
// "Send money" — lets the vendor pick how to send: manually (enter account
// details) or from a saved beneficiary. Opened from the Send money button on
// the wallet page. TODO(api): the next step for each option (transfer form /
// beneficiary picker) isn't designed yet, so selecting is a stub.

import React, { ReactNode } from 'react';
import NiceModal, { create, useModal } from '@ebay/nice-modal-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SendManuallyWidget } from '@/pattern/common/molecules/send-manually-widget';
import { SendBeneficiariesWidget } from '@/pattern/common/molecules/send-beneficiaries-widget';
import { SendManuallyModal } from './send-manually-modal';
import { SelectBeneficiaryModal } from './select-beneficiary-modal';

type SendMethod = 'manually' | 'beneficiaries';

interface SendOption {
  id: SendMethod;
  label: string;
  widget: ReactNode;
}

const OPTIONS: SendOption[] = [
  { id: 'manually', label: 'Send Manually', widget: <SendManuallyWidget /> },
  {
    id: 'beneficiaries',
    label: 'Select Beneficiaries',
    widget: <SendBeneficiariesWidget />,
  },
];

export const SendMoneyModal = create(() => {
  const { visible, resolve, remove } = useModal();

  const handleClose = () => {
    resolve({ resolved: true });
    remove();
  };

  const handleSelect = (option: SendOption) => {
    handleClose();
    NiceModal.show(
      option.id === 'manually' ? SendManuallyModal : SelectBeneficiaryModal
    );
  };

  return (
    <Dialog open={visible} onOpenChange={handleClose}>
      <DialogContent className='max-w-md p-6 dark:bg-muted'>
        <DialogHeader className='text-left pb-4'>
          <DialogTitle className='text-lg font-medium text-[#0C0C0D] dark:text-white'>
            Send money
          </DialogTitle>
        </DialogHeader>

        <p className='text-sm font-normal text-[#0C0C0D] dark:text-white mb-4 mt-4'>
          Choose preferred funding method
        </p>

        <div className='space-y-4'>
          {OPTIONS.map((option) => (
            <button
              key={option.id}
              type='button'
              aria-label={option.label}
              onClick={() => handleSelect(option)}
              className='block w-full overflow-hidden rounded-[10px] text-left transition opacity-95 hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary cursor-pointer'
            >
              {option.widget}
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
});


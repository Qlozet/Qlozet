'use client';

// Fund Wallet Modal - Organism
// "Fund your account" — lets the vendor pick a funding method (Paystack, Kora,
// or Bank transfer). Opened from the Fund wallet button on the wallet page.
// Paystack opens the amount-entry step (POST /wallets/fund → hosted checkout);
// Kora has no backend endpoint yet, so it stays a stub.

import React from 'react';
import NiceModal, { create, useModal } from '@ebay/nice-modal-react';
import Image, { type StaticImageData } from 'next/image';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FundWithBankModal } from './fund-with-bank-modal';
import { FundWithPaystackModal } from './fund-with-paystack-modal';
import paystackLogo from '@/public/assets/image/paystack-logo.png';
import koraLogo from '@/public/assets/image/kora-logo.png';
import bankIcon from '@/public/assets/image/fund-with-bank-icon.png';

type FundingMethod = 'paystack' | 'kora' | 'bank';

interface FundingOption {
  id: FundingMethod;
  title: string;
  description: string;
  icon: StaticImageData | string;
}

const OPTIONS: FundingOption[] = [
  {
    id: 'paystack',
    title: 'Fund with Paystack',
    description: 'You can fund your wallet using a Mastercard or Visa card',
    icon: paystackLogo,
  },
  {
    id: 'kora',
    title: 'Fund with Kora',
    description: 'You can fund your wallet using a Mastercard or Visa card',
    icon: koraLogo,
  },
  {
    id: 'bank',
    title: 'Fund Account with Bank',
    description: 'You can fund your account by paying into the our bank account.',
    icon: bankIcon,
  },
];

export const FundWalletModal = create(() => {
  const { visible, resolve, remove } = useModal();

  const handleClose = () => {
    resolve({ resolved: true });
    remove();
  };

  const handleSelect = (option: FundingOption) => {
    if (option.id === 'bank') {
      handleClose();
      NiceModal.show(FundWithBankModal);
      return;
    }
    if (option.id === 'paystack') {
      handleClose();
      NiceModal.show(FundWithPaystackModal);
      return;
    }
    // TODO(api): Kora funding has no backend endpoint yet.
    toast.info(`${option.title} is coming soon.`);
  };

  return (
    <Dialog open={visible} onOpenChange={handleClose}>
      <DialogContent className='max-w-md p-6 bg-card'>
        <DialogHeader className='text-left pb-4'>
          <DialogTitle className='text-base font-medium text-[#0C0C0D] dark:text-white'>
            Fund your account
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
              onClick={() => handleSelect(option)}
              className='flex w-full items-center gap-4 rounded-[10px] focus:border focus:border-secondary focus-visible:border focus-visible:border-secondary bg-white dark:bg-[#404040] py-4 px-2 text-left transition hover:border hover:border-border focus:outline-none cursor-pointer'
            >
              <Image
                src={option.icon}
                alt=''
                width={40}
                height={40}
                className='size-10 shrink-0 rounded-md'
              />
              <div className='space-y-1'>
                <span className='block text-base font-normal text-[#333333] dark:text-gray-300'>
                  {option.title}
                </span>
                <span className='block text-xs text-[#646A86] dark:text-gray-400'>{option.description}</span>
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
});


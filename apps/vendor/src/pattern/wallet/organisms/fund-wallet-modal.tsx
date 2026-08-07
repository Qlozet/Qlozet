'use client';

// Fund Wallet Modal - Organism
// "Fund your account" — lets the vendor pick a funding method. Only Paystack is
// backed by an endpoint (POST /wallets/fund → hosted checkout); the others are
// listed but disabled, since a funding method that can't take money is worse
// than one that isn't offered.

import React from 'react';
import NiceModal, { create, useModal } from '@ebay/nice-modal-react';
import Image, { type StaticImageData } from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
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
  /** False when no endpoint backs the method — the row renders disabled. */
  available: boolean;
}

const OPTIONS: FundingOption[] = [
  {
    id: 'paystack',
    title: 'Fund with Paystack',
    description: 'You can fund your wallet using a Mastercard or Visa card',
    icon: paystackLogo,
    available: true,
  },
  {
    // TODO(api): no Kora funding endpoint exists.
    id: 'kora',
    title: 'Fund with Kora',
    description: 'You can fund your wallet using a Mastercard or Visa card',
    icon: koraLogo,
    available: false,
  },
  {
    // TODO(api): no deposit/virtual-account endpoint exists, so there are no
    // real account details to show.
    id: 'bank',
    title: 'Fund Account with Bank',
    description: 'You can fund your account by paying into the our bank account.',
    icon: bankIcon,
    available: false,
  },
];

export const FundWalletModal = create(() => {
  const { visible, resolve, remove } = useModal();

  const handleClose = () => {
    resolve({ resolved: true });
    remove();
  };

  const handleSelect = (option: FundingOption) => {
    if (option.id === 'paystack') {
      handleClose();
      NiceModal.show(FundWithPaystackModal);
    }
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
              disabled={!option.available}
              className={cn(
                'flex w-full items-center gap-4 rounded-[10px] bg-white dark:bg-[#404040] py-4 px-2 text-left transition focus:outline-none',
                option.available
                  ? 'cursor-pointer hover:border hover:border-border focus:border focus:border-secondary focus-visible:border focus-visible:border-secondary'
                  : 'cursor-not-allowed opacity-50'
              )}
            >
              <Image
                src={option.icon}
                alt=''
                width={40}
                height={40}
                className='size-10 shrink-0 rounded-md'
              />
              <div className='min-w-0 space-y-1'>
                <span className='flex items-center gap-2 text-base font-normal text-[#333333] dark:text-gray-300'>
                  {option.title}
                  {!option.available && (
                    <span className='rounded-full bg-[#EDEFF2] dark:bg-white/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[#646A86] dark:text-gray-400'>
                      Coming soon
                    </span>
                  )}
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


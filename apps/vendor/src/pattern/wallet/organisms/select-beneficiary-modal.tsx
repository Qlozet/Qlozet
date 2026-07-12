'use client';

// Select Beneficiary Modal - Organism
// Searchable list of saved beneficiaries, opened from the Send money chooser →
// "Select Beneficiaries". The backend exposes no beneficiaries / transfer
// endpoints yet, so the list is a TODO(api) sample and sending is stubbed.

import React, { useMemo, useState } from 'react';
import NiceModal, { create, useModal } from '@ebay/nice-modal-react';
import { ChevronRight, Search } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  SAMPLE_BENEFICIARIES,
  getBeneficiaryInitials,
  type Beneficiary,
} from '../lib/beneficiaries-sample';
import { SendManuallyModal } from './send-manually-modal';

export const SelectBeneficiaryModal = create(() => {
  const { visible, resolve, remove } = useModal();
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleClose = () => {
    resolve({ resolved: true });
    remove();
  };

  // TODO(api): source from GET beneficiaries once the backend exposes it.
  const beneficiaries = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return SAMPLE_BENEFICIARIES;
    return SAMPLE_BENEFICIARIES.filter((b) =>
      [b.name, b.accountNumber, b.bank].some((field) =>
        field.toLowerCase().includes(query)
      )
    );
  }, [search]);

  const handleSend = () => {
    const selected = SAMPLE_BENEFICIARIES.find((b) => b.id === selectedId);
    if (!selected) {
      toast.error('Please select a beneficiary.');
      return;
    }
    // Open the transfer form prefilled with the chosen beneficiary.
    handleClose();
    NiceModal.show(SendManuallyModal, { beneficiary: selected });
  };

  return (
    <Dialog open={visible} onOpenChange={handleClose}>
      <DialogContent className='flex max-h-[85vh] max-w-md flex-col overflow-hidden p-6 bg-card'>
        <DialogHeader className='shrink-0 border-b border-dashed dark:border-border pb-3 text-left mb-4'>
          <DialogTitle className='text-base font-medium text-[#0C0C0D] dark:text-white'>
            Select Beneficiary
          </DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className='relative shrink-0'>
          <Search className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder='Search'
            className='h-12 rounded-lg bg-[#F7F7F7] dark:bg-[#404040] pl-9'
          />
        </div>

        {/* List */}
        <div className='-mr-2 mt-2 flex-1 space-y-1 overflow-y-auto pl-1 pr-2'>
          {beneficiaries.length === 0 ? (
            <p className='py-10 text-center text-sm text-muted-foreground'>
              No beneficiaries found.
            </p>
          ) : (
            beneficiaries.map((beneficiary: Beneficiary) => {
              const selected = beneficiary.id === selectedId;
              return (
                <button
                  key={beneficiary.id}
                  type='button'
                  onClick={() => setSelectedId(beneficiary.id)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl px-2 py-3 text-left transition',
                    selected ? 'bg-secondary/10 ring-1 ring-secondary' : 'hover:bg-gray-50'
                  )}
                >
                  <span className='flex size-11 shrink-0 items-center justify-center rounded-full bg-[#F0955A] text-sm font-semibold text-white'>
                    {getBeneficiaryInitials(beneficiary.name)}
                  </span>
                  <div className='min-w-0 flex-1'>
                    <p className='truncate text-sm font-semibold uppercase text-[#1A1A1A] dark:text-white'>
                      {beneficiary.name}
                    </p>
                    <p className='truncate text-sm text-muted-foreground'>
                      {beneficiary.accountNumber}{' '}
                      <span className='mx-1'>•</span> {beneficiary.bank}
                    </p>
                  </div>
                  <ChevronRight className='size-5 shrink-0 text-muted-foreground' />
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className='flex shrink-0 justify-end gap-3 pt-4'>
          <Button
            type='button'
            variant='outline'
            onClick={handleClose}
            className='min-w-28'
          >
            Close
          </Button>
          <Button type='button' onClick={handleSend} className='min-w-28'>
            Send money
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
});


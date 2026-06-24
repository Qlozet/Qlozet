'use client';

import { useState } from 'react';
import { create, useModal } from '@ebay/nice-modal-react';
import { Minus, Plus } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

// "Set total custom orders per day". There's no backend setting endpoint yet,
// so submitting confirms optimistically. TODO(api): persist the daily cap.
export const SetOrdersPerDayModal = create(() => {
  const { visible, resolve, remove } = useModal();
  const [count, setCount] = useState(0);

  const handleClose = () => {
    resolve({ resolved: true });
    remove();
  };

  const handleSubmit = () => {
    toast.success(`Daily custom order limit set to ${count}.`);
    handleClose();
  };

  return (
    <Dialog open={visible} onOpenChange={handleClose}>
      <DialogContent className='max-w-md'>
        <DialogHeader className='border-b border-dashed pb-4'>
          <DialogTitle className='text-lg font-bold text-grey-black'>
            Set total order per day
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-5 pt-2'>
          <p className='text-sm text-grey3'>
            You can set the number of orders you want to receive for your
            customisable/tailored outfit
          </p>

          <div className='space-y-2'>
            <label className='text-sm font-medium text-grey-black'>
              Set number of orders you want to receive in a day
            </label>
            <div className='flex items-center justify-between rounded-lg border border-border px-4 py-2.5'>
              <input
                type='number'
                min={0}
                value={count}
                onChange={(e) =>
                  setCount(Math.max(0, Number(e.target.value) || 0))
                }
                placeholder='Enter number'
                className='w-full bg-transparent text-sm text-grey-black focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
              />
              <div className='flex shrink-0 items-center gap-3'>
                <button
                  type='button'
                  aria-label='Decrease'
                  onClick={() => setCount((c) => Math.max(0, c - 1))}
                  className='text-grey3 hover:text-grey-black'
                >
                  <Minus className='size-4' />
                </button>
                <span className='min-w-4 text-center text-sm font-medium text-grey-black'>
                  {count}
                </span>
                <button
                  type='button'
                  aria-label='Increase'
                  onClick={() => setCount((c) => c + 1)}
                  className='text-grey3 hover:text-grey-black'
                >
                  <Plus className='size-4' />
                </button>
              </div>
            </div>
          </div>

          <div className='flex justify-end pt-2'>
            <Button type='button' onClick={handleSubmit} className='min-w-[10rem]'>
              Submit
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

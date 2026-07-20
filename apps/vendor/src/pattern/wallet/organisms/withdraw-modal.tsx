'use client';

// Withdraw Modal - Organism
// Owner-only. Withdraws available earnings to the vendor's registered payout
// account via POST /wallets/withdraw (amount-only body). Minimum ₦2,000, and
// the amount can't exceed the available wallet balance. On success the wallet
// balance and transactions refetch automatically (the mutation invalidates
// their tags), so the page updates without a manual refresh.

import React, { useMemo } from 'react';
import { create, useModal } from '@ebay/nice-modal-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWithdrawEarningsMutation } from '@/redux/services/wallet/wallet.api-slice';

const MIN_WITHDRAWAL = 2000;

const formatNaira = (value: number) => `₦${value.toLocaleString()}`;

interface WithdrawModalProps {
  /** Available wallet balance, used to cap the amount and show the max. */
  balance?: number;
}

export const WithdrawModal = create<WithdrawModalProps>(({ balance }) => {
  const { visible, resolve, remove } = useModal();
  const [withdraw, { isLoading }] = useWithdrawEarningsMutation();

  const hasBalance = typeof balance === 'number' && !Number.isNaN(balance);

  // Build the schema with the current balance in scope so the "exceeds balance"
  // rule reflects the live figure.
  const withdrawSchema = useMemo(
    () =>
      z.object({
        amount: z
          .string()
          .min(1, 'Enter an amount')
          .refine(
            (v) => Number(v) >= MIN_WITHDRAWAL,
            `Minimum withdrawal is ${formatNaira(MIN_WITHDRAWAL)}`
          )
          .refine(
            (v) => !hasBalance || Number(v) <= (balance as number),
            'Amount exceeds your available balance'
          ),
      }),
    [balance, hasBalance]
  );

  type WithdrawFormData = z.infer<typeof withdrawSchema>;

  const form = useForm<WithdrawFormData>({
    resolver: zodResolver(withdrawSchema),
    defaultValues: { amount: '' },
  });

  const handleClose = () => {
    form.reset();
    resolve({ resolved: true });
    remove();
  };

  const onSubmit = async (values: WithdrawFormData) => {
    try {
      const response = await withdraw({
        amount: Number(values.amount),
      }).unwrap();
      toast.success(response?.message || 'Withdrawal request submitted.');
      handleClose();
    } catch (error) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ||
        'Could not process the withdrawal. Please try again.';
      toast.error(message);
    }
  };

  const amount = Number(form.watch('amount')) || 0;

  return (
    <Dialog open={visible} onOpenChange={handleClose}>
      <DialogContent className='max-w-md p-6 bg-card'>
        <DialogHeader className='border-b border-dashed dark:border-border pb-3 text-left mb-4'>
          <DialogTitle className='text-base font-medium text-[#0C0C0D] dark:text-white'>
            Withdraw Earnings
          </DialogTitle>
        </DialogHeader>

        <p className='text-sm font-normal text-[#0C0C0D] dark:text-white mb-2'>
          Enter the amount you want to withdraw to your registered bank account.
          The minimum withdrawal is {formatNaira(MIN_WITHDRAWAL)}.
        </p>
        {hasBalance && (
          <p className='text-sm font-medium text-[#646A86] dark:text-gray-400 mb-4'>
            Available balance: {formatNaira(balance as number)}
          </p>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <FormField
              control={form.control}
              name='amount'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-sm font-medium text-[#333333] dark:text-gray-300'>
                    Amount
                  </FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <span className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#646A86] dark:text-gray-400'>
                        ₦
                      </span>
                      <Input
                        inputMode='numeric'
                        placeholder='Enter amount'
                        className='h-12 rounded-lg pl-8'
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.value.replace(/[^\d]/g, ''))
                        }
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='flex justify-end gap-3'>
              <Button
                type='button'
                variant='outline'
                onClick={handleClose}
                className='min-w-28'
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type='submit' className='min-w-28' disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className='size-4 animate-spin' />
                    Processing…
                  </>
                ) : (
                  `Withdraw ₦${amount.toLocaleString()}`
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
});
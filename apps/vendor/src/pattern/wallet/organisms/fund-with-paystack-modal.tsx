'use client';

// Fund With Paystack Modal - Organism
// Amount-entry step for card funding. Opened from the Fund wallet chooser →
// "Fund with Paystack". Submitting calls POST /wallets/fund, then redirects the
// browser to the Paystack hosted checkout returned in the response. On return,
// the wallet page reads the `reference` query param and calls
// GET /wallets/verify/{reference} to credit the wallet.

import React from 'react';
import { create, useModal } from '@ebay/nice-modal-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';
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
import {
  useFundWalletMutation,
  type FundWalletResponseData,
} from '@/redux/services/wallet/wallet.api-slice';
import paystackLogo from '@/public/assets/image/paystack-logo.png';

declare global {
  interface Window {
    PaystackPop?: any;
  }
}

const loadPaystack = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if (window.PaystackPop) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v2/inline.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// Read the Paystack checkout URL from the (undocumented) response envelope,
// tolerating a couple of likely nestings/casings.
const readAuthorizationUrl = (
  data: FundWalletResponseData | undefined
): string | undefined => {
  if (!data) return undefined;
  const nested = (data.data ?? {}) as Record<string, unknown>;
  const url =
    data.authorization_url ??
    (data.authorizationUrl as string | undefined) ??
    (nested.authorization_url as string | undefined) ??
    (nested.authorizationUrl as string | undefined);
  return typeof url === 'string' && url ? url : undefined;
};

const readAccessCode = (
  data: FundWalletResponseData | undefined
): string | undefined => {
  if (!data) return undefined;
  const nested = (data.data ?? {}) as Record<string, unknown>;
  const code =
    data.access_code ??
    (data.accessCode as string | undefined) ??
    (nested.access_code as string | undefined) ??
    (nested.accessCode as string | undefined);
  return typeof code === 'string' && code ? code : undefined;
};

const readReference = (
  data: FundWalletResponseData | undefined
): string | undefined => {
  if (!data) return undefined;
  const nested = (data.data ?? {}) as Record<string, unknown>;
  const ref =
    data.reference ??
    (nested.reference as string | undefined);
  return typeof ref === 'string' && ref ? ref : undefined;
};

const fundSchema = z.object({
  amount: z
    .string()
    .min(1, 'Enter an amount')
    .refine((v) => Number(v) >= 100, 'Minimum amount is ₦100'),
});

type FundFormData = z.infer<typeof fundSchema>;

export const FundWithPaystackModal = create(() => {
  const { visible, resolve, remove } = useModal();
  const [fundWallet, { isLoading }] = useFundWalletMutation();

  const form = useForm<FundFormData>({
    resolver: zodResolver(fundSchema),
    defaultValues: { amount: '' },
  });

  const handleClose = () => {
    form.reset();
    resolve({ resolved: true });
    remove();
  };

  const onSubmit = async (values: FundFormData) => {
    try {
      const response = await fundWallet({ 
        amount: Number(values.amount),
        callback_url: window.location.origin + '/wallet', 
      }).unwrap();
      const checkoutUrl = readAuthorizationUrl(response?.data);
      const accessCode = readAccessCode(response?.data);
      const reference = readReference(response?.data);

      if (accessCode) {
        // Use Paystack Popup (Inline)
        const isLoaded = await loadPaystack();
        if (isLoaded) {
          handleClose(); // Close the nice-modal dialog first
          const paystack = new window.PaystackPop();
          paystack.resumeTransaction(accessCode, {
            onSuccess: (transaction: any) => {
              const ref = transaction?.reference || reference;
              if (ref) {
                // Redirect back to wallet page with reference so it verifies
                window.location.href = `${window.location.origin}/wallet?reference=${ref}`;
              } else {
                toast.error('Payment successful, but no reference returned. Please check your balance.');
              }
            },
            onCancel: () => {
              toast.info('Payment window closed.');
            },
          });
          return;
        }
      }

      // Fallback to hosted checkout if no access code or script failed to load
      if (!checkoutUrl) {
        toast.error(
          response?.message ||
            'Could not start the payment. Please try again.'
        );
        return;
      }

      window.location.href = checkoutUrl;
    } catch (error) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ||
        'Could not start the payment. Please try again.';
      toast.error(message);
    }
  };

  const amount = Number(form.watch('amount')) || 0;

  return (
    <Dialog open={visible} onOpenChange={handleClose}>
      <DialogContent className='max-w-md p-6'>
        <DialogHeader className='border-b border-dashed pb-3 text-left mb-4'>
          <DialogTitle className='flex items-center gap-3 text-base font-medium text-[#0C0C0D]'>
            <Image
              src={paystackLogo}
              alt=''
              width={32}
              height={32}
              className='size-8 rounded-md'
            />
            Fund with Paystack
          </DialogTitle>
        </DialogHeader>

        <p className='text-sm font-normal text-[#0C0C0D] mb-4'>
          Enter the amount you want to add to your wallet. You’ll be redirected
          to Paystack to complete the payment.
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <FormField
              control={form.control}
              name='amount'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-sm font-medium text-[#333333]'>
                    Amount
                  </FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <span className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#646A86]'>
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
                  `Fund ₦${amount.toLocaleString()}`
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
});

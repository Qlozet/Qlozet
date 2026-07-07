'use client';

// Send Manually Modal - Organism
// Manual bank-transfer form opened from the Send money chooser → "Send
// Manually". The backend exposes no transfer / banks / verify-account /
// beneficiary endpoints yet (not in Swagger), so the bank list is a TODO(api)
// sample and submitting is stubbed.

import React from 'react';
import { create, useModal } from '@ebay/nice-modal-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CalendarDays } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import type { Beneficiary } from '../lib/beneficiaries-sample';

// TODO(api): replace with GET banks once the backend exposes the endpoint.
const SAMPLE_BANKS = [
  { code: '044', name: 'Access Bank' },
  { code: '058', name: 'GTBank' },
  { code: '011', name: 'First Bank' },
  { code: '033', name: 'United Bank for Africa' },
  { code: '057', name: 'Zenith Bank' },
  { code: '070', name: 'Fidelity Bank' },
  { code: '032', name: 'Union Bank' },
  { code: '232', name: 'Sterling Bank' },
  { code: '035', name: 'Wema Bank' },
  { code: '050', name: 'Ecobank' },
];

const sendMoneySchema = z.object({
  bankCode: z.string().min(1, 'Please select a bank'),
  accountNumber: z.string().min(1, 'Enter the destination account'),
  accountName: z.string().optional(),
  amount: z.string().min(1, 'Enter an amount'),
  narration: z.string().optional(),
  date: z.string().optional(),
  time: z.string().optional(),
  saveBeneficiary: z.boolean(),
});

type SendMoneyFormData = z.infer<typeof sendMoneySchema>;

const inputClass = 'h-12 rounded-lg';
const labelClass = 'text-sm font-medium text-[#333333] dark:text-gray-300';

interface SendManuallyModalProps {
  // When opened from the beneficiary picker, prefill the form with it.
  beneficiary?: Beneficiary;
}

export const SendManuallyModal = create<SendManuallyModalProps>(
  ({ beneficiary }) => {
    const { visible, resolve, remove } = useModal();

    // Match the beneficiary's bank name to a known bank code (if any) so the
    // Select can prefill; otherwise leave it unselected.
    const initialBankCode = beneficiary
      ? SAMPLE_BANKS.find(
          (b) => b.name.toLowerCase() === beneficiary.bank.toLowerCase()
        )?.code ?? ''
      : '';

    const form = useForm<SendMoneyFormData>({
      resolver: zodResolver(sendMoneySchema),
      defaultValues: {
        bankCode: initialBankCode,
        accountNumber: beneficiary?.accountNumber ?? '',
        accountName: beneficiary?.name ?? '',
        amount: '',
        narration: '',
        date: '',
        time: '',
        saveBeneficiary: true,
      },
    });

    const handleClose = () => {
      form.reset();
      resolve({ resolved: true });
      remove();
    };

    const onSubmit = (_data: SendMoneyFormData) => {
      // TODO(api): POST the transfer once the backend endpoint exists
      // (also verify-account for the name, and save-beneficiary when checked).
      toast.info('Send money is coming soon.');
    };

    const schedule = [form.watch('date'), form.watch('time')]
      .filter(Boolean)
      .join(' ');

    return (
      <Dialog open={visible} onOpenChange={handleClose}>
        <DialogContent className='flex max-h-[85vh] max-w-md flex-col overflow-hidden p-6 dark:bg-muted'>
          <DialogHeader className='shrink-0 border-b border-dashed dark:border-border pb-3 text-left mb-4'>
            <DialogTitle className='text-base font-medium text-[#0C0C0D] dark:text-white'>
              Send Money
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className='min-h-0 flex-1 space-y-4 overflow-y-auto px-1'
            >
              <FormField
                control={form.control}
                name='bankCode'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelClass}>Select bank</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className='h-12 rounded-lg'>
                          <SelectValue placeholder="Select receiver's bank" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SAMPLE_BANKS.map((bank) => (
                          <SelectItem key={bank.code} value={bank.code}>
                            {bank.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='accountNumber'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelClass}>Account number</FormLabel>
                    <FormControl>
                      <Input
                        inputMode='numeric'
                        placeholder='Enter destination account'
                        className={inputClass}
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.value.replace(/\D/g, ''))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* TODO(api): auto-resolve from verify-account once available. */}
              <FormField
                control={form.control}
                name='accountName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelClass}>Account name</FormLabel>
                    <FormControl>
                      <Input className={inputClass} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='amount'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelClass}>Amount</FormLabel>
                    <FormControl>
                      <Input
                        inputMode='numeric'
                        placeholder='Enter amount'
                        className={inputClass}
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.value.replace(/[^\d.]/g, ''))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='narration'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelClass}>Narration</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Enter narration'
                        className={inputClass}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem>
                <FormLabel className={labelClass}>Schedule payment</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type='button'
                      className='flex h-12 w-full items-center justify-between rounded-lg border border-input bg-background px-3 text-left text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                    >
                      <span
                        className={
                          schedule ? 'text-[#333333] dark:text-gray-300' : 'text-muted-foreground'
                        }
                      >
                        {schedule || 'Select time and date'}
                      </span>
                      <CalendarDays className='size-4 text-muted-foreground' />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align='start' className='w-72 space-y-4'>
                    <FormField
                      control={form.control}
                      name='date'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={labelClass}>Date</FormLabel>
                          <FormControl>
                            <Input type='date' className='h-11' {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='time'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={labelClass}>Time</FormLabel>
                          <FormControl>
                            <Input type='time' className='h-11' {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </PopoverContent>
                </Popover>
              </FormItem>

              <FormField
                control={form.control}
                name='saveBeneficiary'
                render={({ field }) => (
                  <FormItem className='flex items-center gap-2 space-y-0 pt-1'>
                    <FormControl>
                      <Checkbox
                        id='save-beneficiary'
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel
                      htmlFor='save-beneficiary'
                      className='cursor-pointer text-sm text-[#333333] dark:text-gray-300'
                    >
                      Save recipient as beneficiary
                    </FormLabel>
                  </FormItem>
                )}
              />

              <div className='flex justify-end gap-3 pt-2'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={handleClose}
                  className='min-w-28'
                >
                  Close
                </Button>
                <Button
                  type='submit'
                  className='min-w-28'
                  disabled={form.formState.isSubmitting}
                >
                  Send money
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    );
  }
);


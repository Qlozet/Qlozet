'use client';

// Reject Return Modal - Organism
// The customer is told exactly why their return was rejected, so a reason is
// required (the backend refuses a rejection without one). They can still
// report a problem on the order for a few days afterwards.

import React from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import {
  useRejectReturnMutation,
  type ReturnRequest,
} from '@/redux/services/returns/returns.api-slice';
import { readReturnRef } from '../lib/return-fields';
import { readApiError } from '@/redux/services/types';

const rejectSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(3, 'Tell the customer why you are rejecting this return.'),
});

type RejectFormData = z.infer<typeof rejectSchema>;

interface RejectReturnModalProps {
  returnRequest: ReturnRequest;
}

export const RejectReturnModal = create<RejectReturnModalProps>(
  ({ returnRequest }) => {
    const { visible, resolve, remove } = useModal();
    const [rejectReturn, { isLoading }] = useRejectReturnMutation();

    const form = useForm<RejectFormData>({
      resolver: zodResolver(rejectSchema),
      defaultValues: { reason: '' },
    });

    const handleClose = () => {
      form.reset();
      resolve({ rejected: false });
      remove();
    };

    const onSubmit = async (values: RejectFormData) => {
      try {
        await rejectReturn({
          id: returnRequest._id,
          reason: values.reason.trim(),
        }).unwrap();
        toast.success('Return rejected. The customer has been told why.');
        resolve({ rejected: true });
        remove();
      } catch (error) {
        toast.error(readApiError(error, 'Could not reject the return.'));
      }
    };

    return (
      <Dialog open={visible} onOpenChange={handleClose}>
        <DialogContent className="max-w-lg p-6 bg-card">
          <DialogHeader className="border-b border-dashed dark:border-border pb-3 text-left mb-4">
            <DialogTitle className="text-base font-medium text-[#0C0C0D] dark:text-white">
              Reject return
            </DialogTitle>
          </DialogHeader>

          <p className="mb-4 text-sm text-[#646A86] dark:text-gray-400">
            Order{' '}
            <span className="font-medium text-[#0C0C0D] dark:text-white">
              {readReturnRef(returnRequest)}
            </span>
            . The customer sees your reason, and can still report a problem on
            the order if they disagree. If we later decide a refund is due, it
            comes out of your earnings for this order.
          </p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-[#333333] dark:text-gray-300">
                      Reason
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        placeholder="For example: the item has been worn and washed."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="min-w-28"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="min-w-28 bg-[#D42620] text-white hover:bg-[#D42620]/90"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Rejecting…
                    </>
                  ) : (
                    'Reject return'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    );
  }
);

export default RejectReturnModal;

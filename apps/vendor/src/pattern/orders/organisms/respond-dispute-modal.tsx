'use client';

// Respond Dispute Modal - Organism
// Lets a vendor submit a counter-response (and optional evidence URLs) to a
// customer dispute via PATCH /disputes/:id/respond.

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
  useRespondToDisputeMutation,
  type Dispute,
} from '@/redux/services/disputes/disputes.api-slice';
import { readDisputeRef, readDisputeReason } from '../lib/dispute-fields';

const respondSchema = z.object({
  vendor_response: z
    .string()
    .trim()
    .min(10, 'Please provide at least a short explanation (10+ characters).'),
  evidence_urls: z.string().optional(),
});

type RespondFormData = z.infer<typeof respondSchema>;

// Split a newline/comma separated list into clean URL strings.
const parseUrls = (raw?: string): string[] =>
  (raw ?? '')
    .split(/[\n,]/)
    .map((u) => u.trim())
    .filter(Boolean);

interface RespondDisputeModalProps {
  dispute: Dispute;
}

export const RespondDisputeModal = create<RespondDisputeModalProps>(
  ({ dispute }) => {
    const { visible, resolve, remove } = useModal();
    const [respond, { isLoading }] = useRespondToDisputeMutation();

    const form = useForm<RespondFormData>({
      resolver: zodResolver(respondSchema),
      defaultValues: {
        vendor_response: dispute.vendor_response ?? '',
        evidence_urls: (dispute.evidence_urls ?? []).join('\n'),
      },
    });

    const handleClose = () => {
      form.reset();
      resolve({ resolved: true });
      remove();
    };

    const onSubmit = async (values: RespondFormData) => {
      try {
        const res = await respond({
          id: dispute._id,
          vendor_response: values.vendor_response.trim(),
          evidence_urls: parseUrls(values.evidence_urls),
        }).unwrap();
        toast.success(res?.message || 'Response submitted.');
        handleClose();
      } catch (error) {
        const message =
          (error as { data?: { message?: string } })?.data?.message ||
          'Could not submit your response. Please try again.';
        toast.error(message);
      }
    };

    return (
      <Dialog open={visible} onOpenChange={handleClose}>
        <DialogContent className='max-w-lg p-6 bg-card'>
          <DialogHeader className='border-b border-dashed dark:border-border pb-3 text-left mb-4'>
            <DialogTitle className='text-base font-medium text-[#0C0C0D] dark:text-white'>
              Respond to Dispute
            </DialogTitle>
          </DialogHeader>

          <div className='mb-4 space-y-1 text-sm'>
            <p className='text-[#646A86] dark:text-gray-400'>
              Order{' '}
              <span className='font-medium text-[#0C0C0D] dark:text-white'>
                {readDisputeRef(dispute)}
              </span>
            </p>
            <p className='text-[#646A86] dark:text-gray-400'>
              Reason:{' '}
              <span className='text-[#0C0C0D] dark:text-white'>
                {readDisputeReason(dispute)}
              </span>
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-5'>
              <FormField
                control={form.control}
                name='vendor_response'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-sm font-medium text-[#333333] dark:text-gray-300'>
                      Your response
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        rows={5}
                        placeholder='Explain your side of the dispute…'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='evidence_urls'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-sm font-medium text-[#333333] dark:text-gray-300'>
                      Evidence links{' '}
                      <span className='font-normal text-[#646A86]'>
                        (optional, one URL per line)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder='https://…'
                        {...field}
                      />
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
                      Submitting…
                    </>
                  ) : (
                    'Submit response'
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
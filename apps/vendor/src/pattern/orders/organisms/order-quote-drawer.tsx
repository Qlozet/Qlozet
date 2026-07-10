'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { create, useModal } from '@ebay/nice-modal-react';
import Image from 'next/image';
import { ArrowLeft, Calculator, ImageIcon, Info } from 'lucide-react';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
  useGetQuoteQuery,
  useSaveQuoteDraftMutation,
  useSubmitQuoteMutation,
  type QuoteLineItem,
} from '@/redux/services/bespoke/bespoke.api-slice';
import {
  formatLongDate,
  readOrderId,
  readQuoteId,
  deliveryBadge,
  readStatus,
} from '../lib/order-fields';
import type { Order } from '@/redux/services/orders/orders.api-slice';
import { SAMPLE_QUOTE, SAMPLE_GARMENT_SPEC } from '../lib/orders-sample';

interface OrderQuoteDrawerProps {
  order: Order;
}

export const OrderQuoteDrawer = create<OrderQuoteDrawerProps>(({ order }) => {
  const { visible, resolve, remove } = useModal();
  const quoteId = readQuoteId(order);

  const { data } = useGetQuoteQuery(quoteId, { skip: !quoteId || !visible });
  const quote = data?.data;

  const [lineItems, setLineItems] = useState<QuoteLineItem[]>(
    SAMPLE_QUOTE.line_items
  );
  const [fabricYards, setFabricYards] = useState(
    SAMPLE_QUOTE.required_fabric_yards
  );
  const [completionDays, setCompletionDays] = useState(
    SAMPLE_QUOTE.estimated_completion_days
  );
  const [notes, setNotes] = useState('');

  // Prefill from the real quote when it loads.
  useEffect(() => {
    if (!quote) return;
    if (quote.line_items?.length) setLineItems(quote.line_items);
    if (typeof quote.required_fabric_yards === 'number')
      setFabricYards(quote.required_fabric_yards);
    if (typeof quote.estimated_completion_days === 'number')
      setCompletionDays(quote.estimated_completion_days);
    if (typeof quote.vendor_notes === 'string') setNotes(quote.vendor_notes);
  }, [quote]);

  const [saveDraft, { isLoading: isSaving }] = useSaveQuoteDraftMutation();
  const [submitQuote, { isLoading: isSubmitting }] = useSubmitQuoteMutation();

  const total = useMemo(
    () => lineItems.reduce((sum, li) => sum + (li.amount || 0), 0),
    [lineItems]
  );

  const handleClose = () => {
    resolve({ resolved: true });
    remove();
  };

  const setAmount = (index: number, amount: number) =>
    setLineItems((prev) =>
      prev.map((li, i) => (i === index ? { ...li, amount } : li))
    );

  const payload = () => ({
    line_items: lineItems,
    required_fabric_yards: fabricYards,
    estimated_completion_days: completionDays,
    vendor_notes: notes || undefined,
  });

  const handleSave = async () => {
    try {
      await saveDraft({ id: quoteId, data: payload() }).unwrap();
      toast.success('Quote saved as draft');
    } catch {
      toast.error('Could not save the quote. Please try again.');
    }
  };

  const handleSubmit = async () => {
    try {
      await submitQuote({ id: quoteId, data: payload() }).unwrap();
      toast.success('Quote submitted');
      handleClose();
    } catch {
      toast.error('Could not submit the quote. Please try again.');
    }
  };

  const status = SAMPLE_QUOTE.status;

  return (
    <Sheet open={visible} onOpenChange={handleClose}>
      <SheetContent
        side='right'
        className='flex w-full flex-col gap-0 overflow-y-auto p-0 sm:max-w-md !top-6 !bottom-6 !right-6 !h-[calc(100vh-3rem)] rounded-2xl custom-card-shadow bg-white dark:bg-[#404040] dark:bg-card'
      >
        {/* Header */}
        <div className='flex items-start justify-between px-6 pb-3 pt-6'>
          <button
            type='button'
            onClick={handleClose}
            aria-label='Back'
            className='flex size-8 items-center justify-center rounded-full border border-border text-grey3 dark:text-gray-300 hover:bg-gray-50'
          >
            <ArrowLeft className='size-4' />
          </button>
          {/* Sheet renders its own close button at top-right */}
        </div>

        <div className='flex items-center justify-between px-6'>
          <div>
            <h2 className='text-lg font-bold text-grey-black dark:text-white'>
              Order #{readOrderId(order)}
            </h2>
            <p className='text-xs text-grey2 dark:text-gray-400'>
              {formatLongDate(order.createdAt)}
            </p>
          </div>
          {(() => {
            const badge = deliveryBadge(readStatus(order));
            return (
              <span className={`inline-flex h-[26px] items-center rounded-[8px] px-3 text-xs font-medium ${badge.className}`}>
                {badge.label}
              </span>
            );
          })()}
        </div>

        <div className='space-y-5 px-6 py-5'>
          {/* Quote card */}
          <section className='space-y-4 rounded-xl bg-[hsla(0,0%,96%,1)] dark:bg-[#4A4949] p-4'>
            <div className='flex items-center justify-between'>
              <h3 className='text-base font-semibold text-grey-black dark:text-white'>Quote</h3>
              <span className='rounded-[8px] bg-[#EAECF0] px-3 py-1 text-xs font-medium text-[#475467]'>
                {status}
              </span>
            </div>
            <p className='text-xs text-grey2 dark:text-gray-400'>
              Build your quote — customer reviews before production starts
            </p>

            {/* Line items */}
            <div className='rounded-xl border border-border bg-white dark:bg-[#404040] p-4'>
              <div className='mb-3 flex items-center justify-between'>
                <span className='text-sm font-semibold text-grey-black dark:text-white'>
                  Line Items
                </span>
                <Calculator className='size-4 text-grey3 dark:text-gray-300' />
              </div>

              <div className='space-y-3'>
                {lineItems.map((li, index) => {
                  const readOnly = li.label.toLowerCase() === 'fabric';
                  return (
                    <div
                      key={li.label}
                      className='flex items-center justify-between gap-3'
                    >
                      <span className='text-sm text-grey3 dark:text-gray-300'>{li.label}</span>
                      <div
                        className={cn(
                          'flex w-32 items-center gap-1 rounded-lg border border-border px-3 py-2',
                          readOnly && 'bg-[hsla(0,0%,96%,1)] dark:bg-[#4A4949]'
                        )}
                      >
                        <span className='text-sm text-grey2 dark:text-gray-400'>$</span>
                        <input
                          type='number'
                          min={0}
                          value={li.amount}
                          readOnly={readOnly}
                          onChange={(e) =>
                            setAmount(index, Number(e.target.value) || 0)
                          }
                          className={cn(
                            'w-full bg-transparent text-right text-sm text-grey-black dark:text-white focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
                            readOnly && 'text-grey2 dark:text-gray-400'
                          )}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className='mt-3 flex items-center justify-between border-t border-border pt-3'>
                <span className='text-sm font-semibold text-grey-black dark:text-white'>
                  Total:
                </span>
                <span className='text-sm font-bold text-grey-black dark:text-white'>
                  N{total.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Required fabric amount */}
            <div className='flex items-center justify-between rounded-xl border border-border bg-white dark:bg-[#404040] px-4 py-3'>
              <span className='text-sm font-semibold text-grey-black dark:text-white'>
                Required fabric amount
              </span>
              <div className='flex items-center gap-2'>
                <input
                  type='number'
                  min={0}
                  value={fabricYards}
                  onChange={(e) => setFabricYards(Number(e.target.value) || 0)}
                  className='w-16 rounded-lg border border-border px-3 py-1.5 text-right text-sm text-grey-black dark:text-white focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
                />
                <span className='text-sm text-grey3 dark:text-gray-300'>yards</span>
              </div>
            </div>

            {/* Estimated completion */}
            <div className='flex items-center justify-between rounded-xl border border-border bg-white dark:bg-[#404040] px-4 py-3'>
              <div>
                <p className='text-sm font-semibold text-grey-black dark:text-white'>
                  Estimated completion
                </p>
                <p className='text-xs text-grey2 dark:text-gray-400'>Days from acceptance</p>
              </div>
              <div className='flex items-center gap-2'>
                <input
                  type='number'
                  min={0}
                  value={completionDays}
                  onChange={(e) =>
                    setCompletionDays(Number(e.target.value) || 0)
                  }
                  className='w-20 rounded-lg border border-border px-3 py-1.5 text-right text-sm text-grey-black dark:text-white focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
                />
                <span className='text-sm text-grey3 dark:text-gray-300'>days</span>
              </div>
            </div>

            {/* Notes */}
            <div className='space-y-1.5'>
              <label className='text-xs font-medium uppercase tracking-wide text-grey2 dark:text-gray-400'>
                Notes to customer
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder='Any special notes, conditions or payment terms...'
                className='min-h-[80px] resize-none bg-white dark:bg-[#404040]'
              />
            </div>

            <div className='space-y-3'>
              <Button
                type='button'
                onClick={handleSubmit}
                disabled={isSubmitting}
                className='w-full'
              >
                {isSubmitting ? 'Submitting...' : 'Submit quote'}
              </Button>
              <Button
                type='button'
                variant='outline'
                onClick={handleSave}
                disabled={isSaving}
                className='w-full'
              >
                {isSaving ? 'Saving...' : 'Save quote'}
              </Button>
            </div>

            <div className='flex items-start gap-2 rounded-lg bg-[#F1F1F1] p-3'>
              <Info className='mt-0.5 size-4 shrink-0 text-grey3 dark:text-gray-300' />
              <p className='text-xs text-grey3 dark:text-gray-300'>
                Custom orders become non-cancellable after cutting begins. If
                something feels off, message the vendor or escalate to Qlozet.
              </p>
            </div>
          </section>

          {/* Garment specs */}
          <section className='space-y-3'>
            <h3 className='text-base font-semibold text-grey-black dark:text-white'>
              Garment Specs
            </h3>
            <div className='flex items-center gap-3 rounded-xl bg-[hsla(0,0%,96%,1)] dark:bg-[#4A4949] p-4'>
              <div className='relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100'>
                {SAMPLE_GARMENT_SPEC.image ? (
                  <Image
                    src={SAMPLE_GARMENT_SPEC.image}
                    alt={SAMPLE_GARMENT_SPEC.name}
                    fill
                    className='object-cover'
                    sizes='48px'
                  />
                ) : (
                  <ImageIcon className='size-5 text-gray-400' />
                )}
              </div>
              <div>
                <p className='text-sm font-semibold text-grey-black dark:text-white'>
                  {SAMPLE_GARMENT_SPEC.name}
                </p>
                <div className='mt-1 flex flex-wrap gap-2'>
                  {SAMPLE_GARMENT_SPEC.tags.map((tag) => (
                    <span
                      key={tag}
                      className='rounded-md bg-white dark:bg-[#404040] px-2 py-0.5 text-[11px] font-medium text-grey3 dark:text-gray-300'
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
});

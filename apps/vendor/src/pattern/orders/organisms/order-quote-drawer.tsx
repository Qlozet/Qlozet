'use client';

import React, { useEffect, useMemo, useState } from 'react';
import NiceModal, { create, useModal } from '@ebay/nice-modal-react';
import Image from 'next/image';
import { Calculator, ChevronRight, ImageIcon, Info } from 'lucide-react';
import { DesignDetailModal } from './design-detail-modal';
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
import { formatLongDate, readQuoteId } from '../lib/order-fields';
import type { Order } from '@/redux/services/orders/orders.api-slice';
import { SAMPLE_QUOTE } from '../lib/orders-sample';

interface OrderQuoteDrawerProps {
  order: Order;
}

export const OrderQuoteDrawer = create<OrderQuoteDrawerProps>(({ order }) => {
  const { visible, resolve, remove } = useModal();
  const quoteId = readQuoteId(order);

  const { data } = useGetQuoteQuery(quoteId, { skip: !quoteId || !visible });
  const quote = data?.data;

  // Real bespoke design — passed on the order from the Quote Requests list, or
  // populated on the fetched quote (getQuoteDetail populates `design`).
  const orderDesign = (order as any)?.bespoke_design;
  const quoteDesign =
    (quote as any)?.design ?? (quote as any)?.data?.design;
  const design: any =
    orderDesign && typeof orderDesign === 'object' ? orderDesign : quoteDesign;

  // Quote state drives what the vendor can do. Editable only while the request
  // is new / a draft / a revision was requested; once submitted or resolved the
  // form is read-only.
  const q: any = (quote as any)?.data ?? quote;
  const quoteStatus = String(
    (order as any)?.bespoke_quote_status ?? q?.status ?? 'pending',
  ).toLowerCase();
  const isEditable = ['pending', 'draft', 'revision_requested'].includes(
    quoteStatus,
  );
  const STATUS_META: Record<string, { label: string; className: string }> = {
    pending: { label: 'New request', className: 'bg-[#FEF6E7] text-[#DD900D]' },
    draft: { label: 'Draft', className: 'bg-[#EAECF0] text-[#475467]' },
    revision_requested: { label: 'Revision requested', className: 'bg-[#F4EBFF] text-[#7E22CE]' },
    submitted: { label: 'Submitted', className: 'bg-[#E7F6EC] text-[#0F973D]' },
    accepted: { label: 'Accepted', className: 'bg-[#E3EFFC] text-[#1671D9]' },
    declined: { label: 'Declined', className: 'bg-[#FBEAE9] text-[#D42620]' },
    expired: { label: 'Expired', className: 'bg-[#FBEAE9] text-[#D42620]' },
  };
  const statusMeta = STATUS_META[quoteStatus] ?? {
    label: quoteStatus,
    className: 'bg-[#EAECF0] text-[#475467]',
  };

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

  return (
    <Sheet open={visible} onOpenChange={handleClose}>
      <SheetContent
        side='right'
        className='flex w-full flex-col gap-0 !overflow-y-auto p-0 sm:max-w-md !top-6 !bottom-6 !right-6 !h-[calc(100vh-3rem)] rounded-2xl custom-card-shadow bg-white dark:bg-[#404040] dark:bg-card'
      >
        {/* Header (the sheet renders its own close button top-right) */}
        <div className='flex shrink-0 flex-col gap-0.5 px-6 pb-1 pr-14 pt-6'>
          <h2 className='truncate text-lg font-bold text-grey-black dark:text-white'>
            {design?.name ||
              (order.reference ? `Order #${order.reference}` : 'Custom order')}
          </h2>
          <p className='text-xs text-grey2 dark:text-gray-400'>
            {order.createdAt
              ? formatLongDate(order.createdAt)
              : 'Bespoke quote request'}
          </p>
        </div>

        <div className='flex flex-col gap-5 px-6 py-5'>
          {/* Quote card */}
          <section className='space-y-4 rounded-xl bg-[hsla(0,0%,96%,1)] dark:bg-[#4A4949] p-4'>
            <div className='flex items-start justify-between gap-2'>
              <div>
                <h3 className='text-base font-semibold text-grey-black dark:text-white'>
                  Your Quote
                </h3>
                <p className='mt-0.5 text-xs text-grey2 dark:text-gray-400'>
                  {isEditable
                    ? 'The customer reviews this before production starts.'
                    : 'This quote is locked.'}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-lg px-2.5 py-1 text-[10px] font-semibold uppercase ${statusMeta.className}`}
              >
                {statusMeta.label}
              </span>
            </div>

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
                  const readOnly = li.label.toLowerCase() === 'fabric' || !isEditable;
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
                        <span className='text-sm text-grey2 dark:text-gray-400'>₦</span>
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
                  ₦{total.toLocaleString()}
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
                  readOnly={!isEditable}
                  onChange={(e) => setFabricYards(Number(e.target.value) || 0)}
                  className={cn(
                    'w-16 rounded-lg border border-border px-3 py-1.5 text-right text-sm text-grey-black dark:text-white focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
                    !isEditable && 'bg-[hsla(0,0%,96%,1)] dark:bg-[#4A4949] text-grey2 dark:text-gray-400'
                  )}
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
                  readOnly={!isEditable}
                  onChange={(e) =>
                    setCompletionDays(Number(e.target.value) || 0)
                  }
                  className={cn(
                    'w-20 rounded-lg border border-border px-3 py-1.5 text-right text-sm text-grey-black dark:text-white focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
                    !isEditable && 'bg-[hsla(0,0%,96%,1)] dark:bg-[#4A4949] text-grey2 dark:text-gray-400'
                  )}
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
                readOnly={!isEditable}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={
                  isEditable
                    ? 'Any special notes, conditions or payment terms...'
                    : 'No notes'
                }
                className={cn(
                  'min-h-[80px] resize-none bg-white dark:bg-[#404040]',
                  !isEditable && 'bg-[hsla(0,0%,96%,1)] dark:bg-[#4A4949]'
                )}
              />
            </div>

            {isEditable ? (
              <div className='space-y-3'>
                <Button
                  type='button'
                  onClick={handleSubmit}
                  disabled={isSubmitting || total <= 0}
                  className='w-full'
                >
                  {isSubmitting
                    ? 'Submitting...'
                    : quoteStatus === 'revision_requested'
                      ? 'Resubmit quote'
                      : 'Submit quote'}
                </Button>
                <Button
                  type='button'
                  variant='outline'
                  onClick={handleSave}
                  disabled={isSaving}
                  className='w-full'
                >
                  {isSaving ? 'Saving...' : 'Save draft'}
                </Button>
              </div>
            ) : (
              <div className='rounded-lg bg-white dark:bg-[#404040] px-3 py-3 text-center text-xs text-grey3 dark:text-gray-300'>
                {quoteStatus === 'submitted' &&
                  'Quote submitted — waiting for the customer to accept or request changes.'}
                {quoteStatus === 'accepted' &&
                  'Accepted — this is now a confirmed order in your Orders.'}
                {quoteStatus === 'declined' &&
                  'The customer chose a different tailor for this design.'}
                {quoteStatus === 'expired' &&
                  'This quote expired before it was accepted.'}
              </div>
            )}

            <div className='flex items-start gap-2 rounded-lg bg-[#F1F1F1] dark:bg-[#404040] p-3'>
              <Info className='mt-0.5 size-4 shrink-0 text-grey3 dark:text-gray-300' />
              <p className='text-xs text-grey3 dark:text-gray-300'>
                Once the customer accepts and pays, this becomes a confirmed
                order you fulfil. Quotes expire after 7 days.
              </p>
            </div>
          </section>

          {/* Design details — compact card that opens the full design modal */}
          {design && (
            <button
              type='button'
              onClick={() => NiceModal.show(DesignDetailModal, { design })}
              className='order-first flex items-center gap-3 rounded-xl bg-[hsla(0,0%,96%,1)] dark:bg-[#4A4949] p-3 text-left transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.03]'
            >
              <div className='relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100'>
                {design.design_images?.[0] ? (
                  <Image
                    src={design.design_images[0]}
                    alt={design.name ?? 'Design'}
                    fill
                    className='object-cover'
                    sizes='56px'
                  />
                ) : (
                  <ImageIcon className='size-5 text-gray-400' />
                )}
              </div>
              <div className='min-w-0 flex-1'>
                <p className='truncate text-sm font-semibold text-grey-black dark:text-white'>
                  {design.name ?? 'Custom design'}
                </p>
                <p className='truncate text-xs capitalize text-grey3 dark:text-gray-400'>
                  {[design.category, design.gender].filter(Boolean).join(' · ') ||
                    'Bespoke design'}
                </p>
              </div>
              <span className='shrink-0 text-xs font-medium text-primary'>
                View details
              </span>
              <ChevronRight className='size-4 shrink-0 text-grey3' />
            </button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
});

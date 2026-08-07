'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { create, useModal } from '@ebay/nice-modal-react';
import Image from 'next/image';
import { ArrowLeft, Calculator, ImageIcon, Info } from 'lucide-react';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
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
import { useAppSelector } from '@/redux/store';
import { selectActiveBusiness } from '@/redux/slices/auth-slice';
import {
  OrderMediaPanel,
  ignoreMediaPanelInteraction,
} from '../molecules/order-media-panel';
import { allProductImages, asProduct } from '../lib/item-resolvers';
import { OrderFabricCard } from '../molecules/order-fabric-card';
import { OrderAccessoriesCard } from '../molecules/order-accessories-card';
import { OrderEarningsCard } from '../molecules/order-earnings-card';
import { VendorGuidelinesCard } from '../molecules/vendor-guidelines-card';
import { SAMPLE_GARMENT_SPEC } from '../lib/orders-sample';

interface OrderQuoteDrawerProps {
  order: Order;
}

// The line-item labels are the form's structure, not data — the amounts start
// at zero and are either typed by the vendor or prefilled from a saved quote.
const EMPTY_LINE_ITEMS: QuoteLineItem[] = [
  { label: 'Base Tailoring', amount: 0 },
  { label: 'Fabric', amount: 0 },
  { label: 'Accessories', amount: 0 },
  { label: 'Add-ons', amount: 0 },
];

/** A quote is editable only while it is still a draft. */
const isDraftStatus = (status?: string): boolean =>
  !status || /draft/i.test(status);

const humanizeStatus = (status?: string): string =>
  status
    ? status.replace(/[_-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : 'Draft';

export const OrderQuoteDrawer = create<OrderQuoteDrawerProps>(({ order }) => {
  const { visible, resolve, remove } = useModal();
  const quoteId = readQuoteId(order);
  const activeBusiness = useAppSelector(selectActiveBusiness);
  const businessId = activeBusiness?._id;

  const { data } = useGetQuoteQuery(quoteId, { skip: !quoteId || !visible });
  const quote = data?.data;

  const [lineItems, setLineItems] =
    useState<QuoteLineItem[]>(EMPTY_LINE_ITEMS);
  const [fabricYards, setFabricYards] = useState(0);
  const [completionDays, setCompletionDays] = useState(0);
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

  // Editable while the quote is a draft; once submitted the vendor can only
  // read it back while the customer reviews.
  const isDraft = isDraftStatus(quote?.status);
  const status = humanizeStatus(quote?.status);

  // Garment media for the companion panel. A bespoke quote request carries the
  // customer's reference images on `bespoke_design` and has no order items at
  // all, so those come first; standard orders fall back to product images.
  const designImages: string[] = Array.isArray(
    (order as any).bespoke_design?.design_images
  )
    ? (order as any).bespoke_design.design_images.filter(
        (url: unknown): url is string => typeof url === 'string' && !!url
      )
    : [];

  const orderMedia = Array.from(
    new Set([
      ...designImages,
      ...(order.items ?? []).flatMap((item) =>
        allProductImages(asProduct(item.product))
      ),
    ])
  );

  return (
    <Sheet open={visible} onOpenChange={handleClose}>
      <OrderMediaPanel
        images={orderMedia}
        title={`Order ${readOrderId(order)}`}
        drawerOpen={visible}
        onClose={handleClose}
      />
      <SheetContent
        side='right'
        onInteractOutside={ignoreMediaPanelInteraction}
        // overflow-hidden here + a scrolling body below: SheetContent's own
        // `sm:overflow-hidden` beats an `overflow-y-auto` passed in, so at
        // desktop widths the drawer clipped its content instead of scrolling.
        className='flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-md !top-6 !bottom-6 !right-6 !h-[calc(100vh-3rem)] rounded-2xl custom-card-shadow bg-white dark:bg-[#404040] dark:bg-card'
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
            <SheetTitle className='text-lg font-bold text-grey-black dark:text-white'>
              Order #{readOrderId(order)}
            </SheetTitle>
            <SheetDescription className='text-xs text-grey2 dark:text-gray-400'>
              {formatLongDate(order.createdAt)}
            </SheetDescription>
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

        {/* Scrollable body */}
        <div className='flex-1 min-h-0 space-y-5 overflow-y-auto px-6 py-5'>
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

            {/* Line items — editable while drafting, a read-only breakdown once
                the quote has been submitted. */}
            <div className='rounded-xl border border-border bg-white dark:bg-[#404040] p-4'>
              <div className='mb-3 flex items-center justify-between'>
                <span className='text-sm font-semibold text-grey-black dark:text-white'>
                  {isDraft ? 'Line Items' : 'Quote break down'}
                </span>
                <Calculator className='size-4 text-grey3 dark:text-gray-300' />
              </div>

              <div className='space-y-3'>
                {lineItems.map((li, index) => {
                  // Fabric is priced from the customer's chosen fabric, so the
                  // vendor never types it.
                  const readOnly = !isDraft || li.label.toLowerCase() === 'fabric';
                  return (
                    <div
                      key={li.label}
                      className='flex items-center justify-between gap-3'
                    >
                      <span className='text-sm text-grey3 dark:text-gray-300'>{li.label}</span>
                      {isDraft ? (
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
                      ) : (
                        <span className='text-sm font-semibold text-grey-black dark:text-white'>
                          N{(li.amount || 0).toLocaleString()}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className='mt-3 flex items-center justify-between border-t border-border pt-3'>
                <span className='text-sm font-semibold text-grey-black dark:text-white'>
                  {isDraft ? 'Total:' : 'TOTAL:'}
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
                  readOnly={!isDraft}
                  onChange={(e) => setFabricYards(Number(e.target.value) || 0)}
                  className={cn(
                    'w-16 rounded-lg px-3 py-1.5 text-right text-sm text-grey-black dark:text-white focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
                    isDraft ? 'border border-border' : 'bg-transparent'
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
                  readOnly={!isDraft}
                  onChange={(e) =>
                    setCompletionDays(Number(e.target.value) || 0)
                  }
                  className={cn(
                    'w-20 rounded-lg px-3 py-1.5 text-right text-sm text-grey-black dark:text-white focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
                    isDraft ? 'border border-border' : 'bg-transparent'
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
                onChange={(e) => setNotes(e.target.value)}
                readOnly={!isDraft}
                placeholder='Any special notes, conditions or payment terms...'
                className='min-h-[80px] resize-none bg-white dark:bg-[#404040]'
              />
            </div>

            {isDraft && (
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
            )}

            <div className='flex items-start gap-2 rounded-lg bg-[#F1F1F1] p-3'>
              <Info className='mt-0.5 size-4 shrink-0 text-grey3 dark:text-gray-300' />
              <p className='text-xs text-grey3 dark:text-gray-300'>
                {isDraft
                  ? 'Custom orders become non-cancellable after cutting begins. If something feels off, message the customer or escalate to Qlozet.'
                  : 'Waiting for customer to review and accept'}
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

          {/* TODO(api): Body Measurement sits here — blocked on an endpoint that
              can return the customer's measurement set for this order.
              GET /measurements/users/active takes no params and only ever
              returns the caller's own set. */}

          {/* Fabric */}
          <OrderFabricCard order={order} businessId={businessId} />

          {/* Accessories & add-ons */}
          <OrderAccessoriesCard order={order} />

          {/* TODO(api): Customers card sits here — needs the per-vendor order
              count ("3 orders with you") and the size profile, which depends on
              the same measurement endpoint as above. */}

          {/* Earnings — the agreed amount, once the quote is settled. */}
          {!isDraft && (
            <OrderEarningsCard
              lineItems={lineItems}
              deliveryFee={order.shipping_fee}
            />
          )}

          <VendorGuidelinesCard />
        </div>
      </SheetContent>
    </Sheet>
  );
});

'use client';

import React from 'react';
import NiceModal, { create, useModal } from '@ebay/nice-modal-react';
import Image from 'next/image';
import { ChevronRight, ImageIcon, Printer } from 'lucide-react';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CustomerDetailsModal } from '../../customers/organisms/customer-details-modal';
import {
  formatDate,
  readCustomerHandle,
  readOrderId,
  readStatus,
  type OrderRow,
} from '../lib/order-fields';
import {
  SAMPLE_ORDER_ITEMS,
  SAMPLE_ORDER_PAYMENT,
  type SampleOrderItem,
} from '../lib/orders-sample';

interface OrderDetailsDrawerProps {
  order: OrderRow;
}

const naira = (n: number) => `$${n.toLocaleString()}`;

const discountPill = (label: string, index: number): string => {
  if (label.includes('$')) return 'bg-[#D42620]';
  return index % 2 === 0 ? 'bg-[#3387CC]' : 'bg-[#0F973D]';
};

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className='flex items-center justify-between border-b border-dashed border-border py-2.5 last:border-0'>
    <span className='text-sm text-grey3'>{label}</span>
    <span className='text-sm font-medium text-grey-black'>{value}</span>
  </div>
);

const OrderItem = ({ item, index }: { item: SampleOrderItem; index: number }) => (
  <div className='flex items-start gap-3 border-b border-border py-3 last:border-0'>
    <div className='relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100'>
      {item.image ? (
        <Image src={item.image} alt={item.name} fill className='object-cover' sizes='56px' />
      ) : (
        <ImageIcon className='size-5 text-gray-400' />
      )}
    </div>
    <div className='min-w-0 flex-1'>
      <p className='text-sm font-medium text-grey-black'>{item.name}</p>
      <p className='text-sm'>
        <span className='font-semibold text-grey-black'>{naira(item.price)}</span>
        {item.oldPrice && (
          <span className='ml-2 text-xs text-grey2 line-through'>
            {naira(item.oldPrice)}
          </span>
        )}
      </p>
      <p className='text-xs text-grey2'>QTY: {item.qty}</p>
      {item.discounts && item.discounts.length > 0 && (
        <div className='mt-2 flex flex-wrap gap-2'>
          {item.discounts.map((d, i) => (
            <span
              key={d}
              className={cn(
                'rounded px-2 py-0.5 text-[11px] font-medium text-white',
                discountPill(d, i)
              )}
            >
              {d}
            </span>
          ))}
        </div>
      )}
    </div>
    <ChevronRight className='mt-1 size-4 shrink-0 text-grey2' />
  </div>
);

export const OrderDetailsDrawer = create<OrderDetailsDrawerProps>(({ order }) => {
  const { visible, resolve, hide, remove } = useModal();

  const handleClose = (open?: boolean | React.MouseEvent) => {
    if (typeof open !== 'boolean' || !open) {
      resolve({ resolved: true });
      hide();
      setTimeout(() => remove(), 300);
    }
  };

  const customerId =
    (typeof order.customer_id === 'string' && order.customer_id) ||
    (typeof (order.customer as { _id?: string })?._id === 'string' &&
      (order.customer as { _id?: string })._id) ||
    '';

  const openCustomer = () => {
    if (customerId) NiceModal.show(CustomerDetailsModal, { customerId });
  };

  // Item visuals/discounts and payment aren't in the loose order payload, so
  // these mirror the design mockup (orders-sample.ts).
  const items = SAMPLE_ORDER_ITEMS;
  const payment = SAMPLE_ORDER_PAYMENT;

  return (
    <Sheet open={visible} onOpenChange={handleClose}>
      <SheetContent
        side='right'
        className='w-full overflow-y-auto p-0 sm:max-w-md !top-6 !bottom-6 !right-6 !h-[calc(100vh-3rem)] rounded-2xl custom-card-shadow'
      >
        <SheetHeader className='border-b border-border px-6 py-4'>
          <SheetTitle className='text-xl font-bold text-grey-black'>
            Order details
          </SheetTitle>
        </SheetHeader>

        <div className='space-y-6 px-6 py-5'>
          {/* Order Summary */}
          <section className='space-y-3'>
            <h3 className='text-base font-semibold text-grey-black'>
              Order Summary
            </h3>
            <div className='rounded-xl bg-[#F8F9FA] px-4 py-2'>
              <Row label='Order ID:' value={readOrderId(order)} />
              <Row
                label='Order date:'
                value={formatDate(order.createdAt ?? order.date)}
              />
              <Row
                label='Status:'
                value={
                  <span className='capitalize'>{readStatus(order)}</span>
                }
              />
              <Row
                label='Customer:'
                value={
                  <button
                    type='button'
                    onClick={openCustomer}
                    className='text-[#3387CC] underline-offset-2 hover:underline'
                  >
                    {readCustomerHandle(order)}
                  </button>
                }
              />
            </div>
          </section>

          {/* Order items */}
          <section className='space-y-2'>
            <h3 className='text-base font-semibold text-grey-black'>
              Order items ({items.length})
            </h3>
            <div className='rounded-xl bg-[#F8F9FA] px-4'>
              {items.map((item, index) => (
                <OrderItem key={item.name} item={item} index={index} />
              ))}
            </div>
          </section>

          {/* Payment and Invoice */}
          <section className='space-y-3'>
            <div className='flex items-center justify-between'>
              <h3 className='text-base font-semibold text-grey-black'>
                Payment and Invoice
              </h3>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => toast.info('Print invoice is coming soon.')}
                className='h-9 gap-2 text-sm'
              >
                <Printer className='size-4' />
                Print invoice
              </Button>
            </div>
            <div className='rounded-xl bg-[#F8F9FA] px-4 py-2'>
              <Row label='Total' value={naira(payment.total)} />
              <Row
                label='Payment Status:'
                value={<span className='text-success'>{payment.paymentStatus}</span>}
              />
              <Row
                label='Refund Status:'
                value={<span className='text-success'>{payment.refundStatus}</span>}
              />
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
});

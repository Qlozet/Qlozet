'use client';

// Order Details Drawer — Organism
// Slide-over sheet showing a single order's summary, vendor-filtered items,
// payment, shipment status, and fulfillment workflow.
// There is NO single-order detail endpoint — the order data is passed from the
// cached list query.

import React from 'react';
import NiceModal, { create, useModal } from '@ebay/nice-modal-react';
import {
  Printer,
  Package,
  Copy,
  Check,
  ExternalLink,
  Truck,
  Tag,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  type Order,
  type OrderItem,
  type VendorShipment,
  getVendorItems,
  getVendorShipment,
  getVendorSubtotal,
  useFulfillOrderMutation,
} from '@/redux/services/orders/orders.api-slice';
import { useAppSelector } from '@/redux/store';
import { selectActiveBusiness } from '@/redux/slices/auth-slice';
import { CustomerDetailsModal } from '../../customers/organisms/customer-details-modal';
import {
  deliveryBadge,
  formatDate,
  formatNaira,
  readCustomerHandle,
  readCustomerName,
  readOrderId,
  readStatus,
  shipmentStatusBadge,
} from '../lib/order-fields';

interface OrderDetailsDrawerProps {
  order: Order;
}

/* ------------------------------------------------------------------ */
/*  Shared layout atoms                                                */
/* ------------------------------------------------------------------ */

const DetailRow = ({
  label,
  value,
  isLast = false,
}: {
  label: string;
  value: React.ReactNode;
  isLast?: boolean;
}) => (
  <div
    className={cn(
      'flex items-center justify-between gap-4 px-5 py-3.5',
      !isLast && 'border-b border-[#DDE2E5] dark:border-border'
    )}
  >
    <span className='text-sm text-grey3 dark:text-gray-400'>{label}</span>
    <span className='text-right text-sm font-medium text-[#333333] dark:text-white'>
      {value}
    </span>
  </div>
);

const SectionTitle = ({
  children,
  trailing,
}: {
  children: React.ReactNode;
  trailing?: React.ReactNode;
}) => (
  <div className='flex items-center justify-between'>
    <h3 className='text-sm font-semibold text-[#0C0C0D] dark:text-white'>
      {children}
    </h3>
    {trailing}
  </div>
);

const Card = ({ children }: { children: React.ReactNode }) => (
  <div className='rounded-[20px] bg-[hsla(0,0%,96%,1)] dark:bg-[#4A4949] dark:border dark:border-border overflow-hidden'>
    {children}
  </div>
);

/* ------------------------------------------------------------------ */
/*  Order item row                                                     */
/* ------------------------------------------------------------------ */

const OrderItemRow: React.FC<{
  item: OrderItem;
  isLast?: boolean;
}> = ({ item, isLast = false }) => {
  const product =
    typeof item.product === 'object' && item.product !== null
      ? item.product
      : null;
  const name = product?.name ?? 'Product';

  // Sum up all selection amounts for total
  let totalAmount = 0;
  let totalQty = 0;
  item.color_variant_selections?.forEach((v) => {
    totalAmount += v.total_amount;
    totalQty += v.quantity;
  });
  item.fabric_selections?.forEach((f) => {
    totalAmount += f.total_amount;
    totalQty += f.quantity;
  });
  item.style_selections?.forEach((s) => {
    totalAmount += s.total_amount;
    totalQty += s.quantity;
  });
  item.accessory_selections?.forEach((a) => {
    totalAmount += a.total_amount;
    totalQty += a.quantity;
  });

  // Variant summary
  const variantParts = item.color_variant_selections
    ?.map((v) => v.size)
    .filter(Boolean) ?? [];

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-5 py-3.5',
        !isLast && 'border-b border-[#DDE2E5] dark:border-border'
      )}
    >
      {/* Thumbnail */}
      <div className='relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700'>
        <Package className='size-4 text-gray-400' />
      </div>

      {/* Info */}
      <div className='min-w-0 flex-1'>
        <p className='truncate text-sm font-medium text-[#333333] dark:text-white'>
          {name}
        </p>
        {variantParts.length > 0 && (
          <p className='text-xs text-grey3 dark:text-gray-400'>
            {variantParts.join(' · ')}
          </p>
        )}
        {item.note && (
          <p className='mt-0.5 text-xs text-grey3 dark:text-gray-400 italic'>
            Note: {item.note}
          </p>
        )}
      </div>

      {/* Qty + price */}
      <div className='shrink-0 text-right'>
        <p className='text-sm font-medium text-[#333333] dark:text-white'>
          {formatNaira(totalAmount)}
        </p>
        {totalQty > 0 && (
          <p className='text-xs text-grey3 dark:text-gray-400'>
            Qty: {totalQty}
          </p>
        )}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Copy-to-clipboard hook                                             */
/* ------------------------------------------------------------------ */

const useCopyId = () => {
  const [copied, setCopied] = React.useState(false);
  const copy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return { copied, copy };
};

/* ------------------------------------------------------------------ */
/*  Main drawer                                                        */
/* ------------------------------------------------------------------ */

export const OrderDetailsDrawer = create<OrderDetailsDrawerProps>(
  ({ order }) => {
    const { visible, resolve, hide, remove } = useModal();
    const { copied, copy } = useCopyId();

    // Vendor business ID for filtering items/shipments
    const activeBusiness = useAppSelector(selectActiveBusiness);
    const businessId = activeBusiness?._id ?? '';

    // Vendor-specific data
    const vendorItems = businessId
      ? getVendorItems(order, businessId)
      : order.items;
    const vendorShipment = businessId
      ? getVendorShipment(order, businessId)
      : order.shipments?.[0];
    const vendorSubtotal = businessId
      ? getVendorSubtotal(order, businessId)
      : order.subtotal;

    // Fulfillment
    const [fulfillOrder, { isLoading: isFulfilling }] =
      useFulfillOrderMutation();

    const canFulfill =
      ['pending', 'in_review', 'processing'].includes(order.status) &&
      (!vendorShipment || vendorShipment.status === 'pending');

    const hasLabel =
      vendorShipment?.label_url && vendorShipment.status !== 'pending';

    const handleFulfill = async () => {
      try {
        await fulfillOrder({ reference: order.reference }).unwrap();
        toast.success('Shipping label created!');
      } catch {
        toast.error('Could not create shipping label. Please try again.');
      }
    };

    const handleClose = (open?: boolean | React.MouseEvent) => {
      if (typeof open !== 'boolean' || !open) {
        resolve({ resolved: true });
        hide();
        setTimeout(() => remove(), 300);
      }
    };

    // Customer link
    const customerId = order.customer?._id ?? '';
    const openCustomer = () => {
      if (customerId)
        NiceModal.show(CustomerDetailsModal, { customerId });
    };

    // Badge
    const badge = deliveryBadge(readStatus(order));
    const displayOrderId = readOrderId(order);

    // Shipping address
    const addr = order.address ?? {};
    const addressParts = [
      addr.street,
      addr.city,
      addr.state,
      addr.country,
    ].filter((v) => typeof v === 'string' && v.trim()) as string[];

    return (
      <Sheet open={visible} onOpenChange={handleClose}>
        <SheetContent
          side='right'
          className='flex w-full flex-col overflow-hidden p-0 sm:max-w-[440px] !top-6 !bottom-6 !right-6 !h-[calc(100vh-3rem)] rounded-2xl custom-card-shadow bg-white dark:bg-card'
        >
          {/* Header */}
          <SheetHeader className='shrink-0 border-b border-border px-6 py-5'>
            <div className='flex items-center justify-between'>
              <SheetTitle className='text-lg font-semibold text-[#0C0C0D] dark:text-white'>
                Order details
              </SheetTitle>
              <span
                className={cn(
                  'inline-flex h-[26px] items-center justify-center whitespace-nowrap rounded-lg px-3 text-xs font-medium',
                  badge.className
                )}
              >
                {badge.label}
              </span>
            </div>
          </SheetHeader>

          {/* Scrollable body */}
          <div className='flex-1 overflow-y-auto'>
            <div className='space-y-5 px-6 py-5'>
              {/* ── Order Summary ── */}
              <section className='space-y-3'>
                <SectionTitle>Order Summary</SectionTitle>
                <Card>
                  <DetailRow
                    label='Order ID'
                    value={
                      <button
                        type='button'
                        onClick={() => copy(displayOrderId)}
                        className='inline-flex items-center gap-1.5 text-sm font-medium text-[#333333] dark:text-white hover:text-primary transition-colors'
                      >
                        {displayOrderId}
                        {copied ? (
                          <Check className='size-3.5 text-green-600' />
                        ) : (
                          <Copy className='size-3.5 text-grey3' />
                        )}
                      </button>
                    }
                  />
                  <DetailRow
                    label='Date'
                    value={formatDate(order.createdAt)}
                  />
                  <DetailRow
                    label='Customer'
                    value={
                      customerId ? (
                        <button
                          type='button'
                          onClick={openCustomer}
                          className='inline-flex items-center gap-1 text-[#3387CC] hover:underline underline-offset-2 transition-colors'
                        >
                          {readCustomerHandle(order)}
                          <ExternalLink className='size-3' />
                        </button>
                      ) : (
                        readCustomerName(order)
                      )
                    }
                  />
                  <DetailRow
                    label='Items'
                    value={`${vendorItems.length} item${vendorItems.length === 1 ? '' : 's'}`}
                  />
                  {order.type === 'bespoke' && (
                    <DetailRow
                      label='Type'
                      value={
                        <span className='inline-flex items-center gap-1'>
                          <Tag className='size-3' />
                          Bespoke
                        </span>
                      }
                    />
                  )}
                  <DetailRow
                    label='Total'
                    value={
                      <span className='text-base font-semibold text-[#0C0C0D] dark:text-white'>
                        {formatNaira(order.total)}
                      </span>
                    }
                    isLast
                  />
                </Card>
              </section>

              {/* ── Vendor Items ── */}
              <section className='space-y-3'>
                <SectionTitle>
                  Your items ({vendorItems.length})
                </SectionTitle>

                {vendorItems.length > 0 ? (
                  <Card>
                    {vendorItems.map((item, index) => (
                      <OrderItemRow
                        key={index}
                        item={item}
                        isLast={index === vendorItems.length - 1}
                      />
                    ))}
                  </Card>
                ) : (
                  <Card>
                    <div className='flex flex-col items-center justify-center gap-2 px-5 py-8 text-center'>
                      <Package className='size-8 text-grey3 dark:text-gray-500' />
                      <p className='text-sm text-grey3 dark:text-gray-400'>
                        No items from your store in this order.
                      </p>
                    </div>
                  </Card>
                )}
              </section>

              {/* ── Payment ── */}
              <section className='space-y-3'>
                <SectionTitle>Payment</SectionTitle>
                <Card>
                  <DetailRow
                    label='Your subtotal'
                    value={formatNaira(vendorSubtotal)}
                  />
                  <DetailRow
                    label='Shipping fee'
                    value={formatNaira(
                      vendorShipment?.shipping_fee ?? order.shipping_fee
                    )}
                  />
                  <DetailRow
                    label='Order total'
                    value={
                      <span className='text-base font-semibold text-[#0C0C0D] dark:text-white'>
                        {formatNaira(order.total)}
                      </span>
                    }
                  />
                  {order.vendor_earnings !== undefined && (
                    <DetailRow
                      label='Your earnings'
                      value={
                        <span className='text-[#0F973D] font-semibold'>
                          {formatNaira(order.vendor_earnings)}
                        </span>
                      }
                    />
                  )}
                  {order.payout_status && (
                    <DetailRow
                      label='Payout'
                      value={
                        <span className='capitalize'>
                          {order.payout_status}
                        </span>
                      }
                      isLast
                    />
                  )}
                </Card>
              </section>

              {/* ── Shipment ── */}
              {vendorShipment && vendorShipment.status !== 'pending' && (
                <section className='space-y-3'>
                  <SectionTitle>Shipment</SectionTitle>
                  <Card>
                    <DetailRow
                      label='Status'
                      value={
                        (() => {
                          const sBadge = shipmentStatusBadge(
                            vendorShipment.status
                          );
                          return (
                            <span
                              className={cn(
                                'inline-flex h-[26px] items-center justify-center whitespace-nowrap rounded-lg px-3 text-xs font-medium',
                                sBadge.className
                              )}
                            >
                              {sBadge.label}
                            </span>
                          );
                        })()
                      }
                    />
                    {vendorShipment.courier_name && (
                      <DetailRow
                        label='Courier'
                        value={vendorShipment.courier_name}
                      />
                    )}
                    {vendorShipment.tracking_number && (
                      <DetailRow
                        label='Tracking #'
                        value={
                          <button
                            type='button'
                            onClick={() =>
                              copy(vendorShipment.tracking_number!)
                            }
                            className='inline-flex items-center gap-1.5 text-sm font-medium text-[#333333] dark:text-white hover:text-primary transition-colors'
                          >
                            {vendorShipment.tracking_number}
                            <Copy className='size-3.5 text-grey3' />
                          </button>
                        }
                        isLast
                      />
                    )}
                  </Card>
                </section>
              )}

              {/* ── Delivery Address ── */}
              {addressParts.length > 0 && (
                <section className='space-y-3'>
                  <SectionTitle>Delivery address</SectionTitle>
                  <Card>
                    <div className='px-5 py-4'>
                      <p className='text-sm text-[#333333] dark:text-white leading-relaxed'>
                        {addressParts.join(', ')}
                      </p>
                      {typeof addr.phone === 'string' && addr.phone && (
                        <p className='mt-1 text-xs text-grey3 dark:text-gray-400'>
                          {addr.phone}
                        </p>
                      )}
                    </div>
                  </Card>
                </section>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className='shrink-0 border-t border-border px-6 py-4'>
            <div className='flex items-center gap-3'>
              {canFulfill && (
                <Button
                  type='button'
                  onClick={handleFulfill}
                  disabled={isFulfilling}
                  className='flex-1 h-11 gap-2 text-sm'
                >
                  <Truck className='size-4' />
                  {isFulfilling ? 'Creating label...' : 'Fulfill Order'}
                </Button>
              )}
              {hasLabel && (
                <Button
                  type='button'
                  variant='outline'
                  onClick={() =>
                    window.open(vendorShipment!.label_url!, '_blank')
                  }
                  className='flex-1 h-11 gap-2 text-sm'
                >
                  <Printer className='size-4' />
                  Print Label
                </Button>
              )}
              {!canFulfill && !hasLabel && (
                <Button
                  type='button'
                  variant='outline'
                  onClick={() =>
                    toast.info('Print invoice is coming soon.')
                  }
                  className='flex-1 h-11 gap-2 text-sm'
                >
                  <Printer className='size-4' />
                  Print invoice
                </Button>
              )}
              <Button
                type='button'
                variant={canFulfill || hasLabel ? 'outline' : 'default'}
                onClick={handleClose}
                className='flex-1 h-11 text-sm'
              >
                Close
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }
);

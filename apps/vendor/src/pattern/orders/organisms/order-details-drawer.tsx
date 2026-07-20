'use client';

// Order Details Drawer — Organism
// Slide-over sheet showing a single order's summary, vendor-filtered items,
// payment, shipment status, and fulfillment workflow.
// There is NO single-order detail endpoint — the order data is passed from the
// cached list query.

import React, { useState } from 'react';
import Image from 'next/image';
import NiceModal, { create, useModal } from '@ebay/nice-modal-react';
import {
  Printer,
  Package,
  Copy,
  Check,
  ExternalLink,
  Truck,
  Tag,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  ShieldAlert,
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
  type PopulatedProduct,
  getVendorItems,
  getVendorShipment,
  getVendorSubtotal,
  getFabricTransferShipments,
  getIncomingFabricTransfers,
  getPendingIncomingFabricTransfers,
  extractBizName,
  extractFabricName,
  useFulfillOrderMutation,
  useConfirmOrderMutation,
  useRejectOrderMutation,
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
/*  Product helpers                                                     */
/* ------------------------------------------------------------------ */

/** Resolve the display name from a populated product */
function getProductName(product: PopulatedProduct | null): string {
  if (!product) return 'Product';
  // Kind-specific names take priority
  if (product.clothing?.name) return product.clothing.name;
  if (product.fabric?.name) return product.fabric.name;
  if (product.accessory?.name) return product.accessory.name;
  return product.name ?? 'Product';
}

/** Resolve the first image URL from a populated product */
function getProductImageUrl(product: PopulatedProduct | null): string | null {
  if (!product) return null;

  // Try kind-specific images first (they have the proper sub-doc structure)
  const kindImages =
    product.clothing?.images ??
    product.fabric?.images ??
    product.accessory?.images;
  if (kindImages?.length) {
    const first = kindImages[0];
    if (typeof first === 'object' && first?.url) return first.url;
  }

  // Fallback to top-level images array
  if (product.images?.length) {
    const first = product.images[0];
    if (typeof first === 'string') return first;
    if (typeof first === 'object' && first?.url) return first.url;
  }
  return null;
}

/** Kind badge config */
const KIND_BADGE: Record<string, { label: string; className: string }> = {
  clothing: { label: 'Clothing', className: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' },
  fabric:   { label: 'Fabric',   className: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  accessory:{ label: 'Accessory',className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
};

/* ------------------------------------------------------------------ */
/*  Order item row                                                     */
/* ------------------------------------------------------------------ */

const OrderItemRow: React.FC<{
  item: OrderItem;
  isLast?: boolean;
}> = ({ item, isLast = false }) => {
  const [expanded, setExpanded] = React.useState(false);
  const product =
    typeof item.product === 'object' && item.product !== null
      ? (item.product as PopulatedProduct)
      : null;
  const name = getProductName(product);
  const imageUrl = getProductImageUrl(product);
  const kind = product?.kind;
  const kindBadge = kind ? KIND_BADGE[kind] : null;
  const basePrice = product?.base_price;
  const description = product?.clothing?.description;

  // Sum up all selection amounts for total
  let totalAmount = item.total_price ?? 0;
  let totalQty = 0;
  
  if (totalAmount === 0) {
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
    item.addon_selections?.forEach((ad) => {
      totalAmount += ad.total_amount;
      totalQty += ad.quantity;
    });
  } else {
    item.color_variant_selections?.forEach((v) => (totalQty += v.quantity));
    item.fabric_selections?.forEach((f) => (totalQty += f.quantity));
    item.style_selections?.forEach((s) => (totalQty += s.quantity));
    item.accessory_selections?.forEach((a) => (totalQty += a.quantity));
    item.addon_selections?.forEach((ad) => (totalQty += ad.quantity));
  }

  const renderSelectionTable = (
    title: string,
    rows: { label: string; qty: number; unitPrice: number; total: number }[]
  ) => {
    if (!rows.length) return null;
    return (
      <div className='mt-4'>
        <p className='text-xs font-semibold text-[#333333] dark:text-gray-200 mb-2'>{title}</p>
        <div className='rounded-lg border border-[#E5E7EB] dark:border-border/60 overflow-hidden'>
          <div className='grid grid-cols-[1fr_50px_70px_80px] gap-0 text-[10px] uppercase tracking-wider font-semibold text-grey3 dark:text-gray-500 bg-gray-50 dark:bg-gray-800/50 px-3 py-1.5 border-b border-[#E5E7EB] dark:border-border/60'>
            <span>Detail</span>
            <span className='text-center'>Qty</span>
            <span className='text-right'>Unit</span>
            <span className='text-right'>Total</span>
          </div>
          {rows.map((row, i) => (
            <div
              key={i}
              className={cn(
                'grid grid-cols-[1fr_50px_70px_80px] gap-0 px-3 py-2 text-xs',
                i !== rows.length - 1 && 'border-b border-[#F3F4F6] dark:border-border/30'
              )}
            >
              <span className='text-[#333333] dark:text-gray-200 truncate pr-2'>{row.label}</span>
              <span className='text-center text-grey3 dark:text-gray-400'>×{row.qty}</span>
              <span className='text-right text-grey3 dark:text-gray-400'>{formatNaira(row.unitPrice)}</span>
              <span className='text-right font-medium text-[#333333] dark:text-white'>{formatNaira(row.total)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const hasExtraDetails = !!(
    item.color_variant_selections?.length ||
    item.style_selections?.length ||
    item.fabric_selections?.length ||
    item.accessory_selections?.length ||
    item.addon_selections?.length ||
    item.note ||
    description
  );

  return (
    <div
      className={cn(
        'px-5 py-4',
        !isLast && 'border-b border-[#DDE2E5] dark:border-border'
      )}
    >
      <div 
        className={cn('flex items-start gap-3', hasExtraDetails && 'cursor-pointer group')}
        onClick={() => hasExtraDetails && setExpanded(!expanded)}
      >
        {/* Thumbnail */}
        <div className='relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-700'>
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              className='object-cover'
              sizes='48px'
            />
          ) : (
            <Package className='size-5 text-gray-400' />
          )}
        </div>

        {/* Info */}
        <div className='min-w-0 flex-1'>
          <div className='flex justify-between items-start gap-2'>
            <div className='min-w-0'>
              <p className='truncate text-sm font-medium text-[#333333] dark:text-white group-hover:text-primary transition-colors'>
                {name}
              </p>
              <div className='flex items-center gap-2 mt-1 flex-wrap'>
                {kindBadge && (
                  <span className={cn('inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold', kindBadge.className)}>
                    {kindBadge.label}
                  </span>
                )}
                {basePrice !== undefined && (
                  <span className='text-[11px] text-grey3 dark:text-gray-400'>
                    Base: {formatNaira(basePrice)}
                  </span>
                )}
              </div>
              {item.applied_fabric && (
                <p className='text-xs text-grey3 dark:text-gray-400 mt-1'>
                  Using {item.applied_fabric_yards} yards of {item.applied_fabric}
                </p>
              )}
            </div>
            <div className='shrink-0 text-right'>
              <p className='text-sm font-semibold text-[#0C0C0D] dark:text-white'>
                {formatNaira(totalAmount)}
              </p>
              {totalQty > 0 && (
                <p className='text-[11px] text-grey3 dark:text-gray-400 mt-0.5'>
                  {totalQty} item{totalQty !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
          
          {hasExtraDetails && (
            <div className='mt-2 flex items-center gap-1 text-xs font-medium text-primary'>
              {expanded ? 'Hide details' : 'View details'}
              <svg 
                className={cn('size-3.5 transition-transform duration-200', expanded && 'rotate-180')} 
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Expandable Details */}
      {hasExtraDetails && expanded && (
        <div className='mt-4 ml-[60px] pb-1 border-t border-[#DDE2E5] dark:border-border/50 pt-4 space-y-1'>
          {/* Product description */}
          {description && (
            <div className='mb-3'>
              <p className='text-xs font-semibold text-[#333333] dark:text-gray-200 mb-1'>Description</p>
              <p className='text-xs text-grey3 dark:text-gray-400 leading-relaxed line-clamp-3'>
                {description}
              </p>
            </div>
          )}

          {/* Variant selections */}
          {renderSelectionTable(
            'Variants',
            (item.color_variant_selections ?? []).map((v) => ({
              label: `${v.color ?? 'Standard'}${v.size ? ` · ${v.size}` : ''}`,
              qty: v.quantity,
              unitPrice: v.price,
              total: v.total_amount,
            }))
          )}

          {/* Style selections */}
          {renderSelectionTable(
            'Styles',
            (item.style_selections ?? []).map((s) => ({
              label: `Style`,
              qty: s.quantity,
              unitPrice: s.price,
              total: s.total_amount,
            }))
          )}

          {/* Fabric selections */}
          {renderSelectionTable(
            'Fabrics',
            (item.fabric_selections ?? []).map((f) => ({
              label: `Fabric (${f.yardage ?? f.yards ?? '—'} yds)`,
              qty: f.quantity,
              unitPrice: f.price,
              total: f.total_amount,
            }))
          )}

          {/* Accessory selections */}
          {renderSelectionTable(
            'Accessories',
            (item.accessory_selections ?? []).map((a) => ({
              label: 'Accessory',
              qty: a.quantity,
              unitPrice: a.price,
              total: a.total_amount,
            }))
          )}

          {/* Addon selections */}
          {renderSelectionTable(
            'Add-ons',
            (item.addon_selections ?? []).map((a) => ({
              label: 'Add-on',
              qty: a.quantity,
              unitPrice: a.price,
              total: a.total_amount,
            }))
          )}

          {/* Item total summary */}
          <div className='mt-4 flex items-center justify-between rounded-lg bg-gray-50 dark:bg-gray-800/50 px-3 py-2'>
            <span className='text-xs font-semibold text-[#333333] dark:text-gray-200'>Item Total</span>
            <span className='text-sm font-bold text-[#0C0C0D] dark:text-white'>{formatNaira(totalAmount)}</span>
          </div>

          {/* Customer note */}
          {item.note && (
            <div className='mt-4'>
              <p className='text-xs font-semibold text-[#333333] dark:text-gray-200 mb-1.5'>Customer Note</p>
              <div className='rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 px-3 py-2.5'>
                <p className='text-xs text-amber-800 dark:text-amber-200 italic leading-relaxed'>
                  &ldquo;{item.note}&rdquo;
                </p>
              </div>
            </div>
          )}
        </div>
      )}
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
    const [confirmOrder, { isLoading: isConfirming }] =
      useConfirmOrderMutation();
    const [rejectOrder, { isLoading: isRejecting }] =
      useRejectOrderMutation();

    // Reject dialog state
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    // Confirmation state derived from shipment
    const isConfirmed = vendorShipment?.confirmed === true;
    const isRejected = vendorShipment?.rejected === true;
    const needsConfirmation =
      ['pending', 'in_review'].includes(order.status) &&
      vendorShipment &&
      !isConfirmed &&
      !isRejected;

    const canFulfillBase =
      ['pending', 'in_review', 'processing'].includes(order.status) &&
      (!vendorShipment || vendorShipment.status === 'pending') &&
      isConfirmed; // Must be confirmed before fulfillment

    // Fabric transfer data
    const outgoingFabricTransfers = businessId
      ? getFabricTransferShipments(order, businessId)
      : [];
    const incomingFabricTransfers = businessId
      ? getIncomingFabricTransfers(order, businessId)
      : [];
    const pendingIncomingFabric = businessId
      ? getPendingIncomingFabricTransfers(order, businessId)
      : [];

    // Block fulfillment if there are pending incoming fabric transfers
    const canFulfill = canFulfillBase && pendingIncomingFabric.length === 0;

    const hasLabel =
      vendorShipment?.label_url && vendorShipment.status !== 'pending';

    const handleFulfill = async () => {
      try {
        await fulfillOrder({ reference: order.reference }).unwrap();
        toast.success('Shipping label created!');
      } catch (err: any) {
        const errorMsg =
          err?.data?.message ||
          err?.error ||
          'Could not create shipping label. Please try again.';
        toast.error(errorMsg);
      }
    };

    const handleConfirm = async () => {
      try {
        await confirmOrder({ reference: order.reference }).unwrap();
        toast.success('Order confirmed! You can now prepare it for fulfillment.');
      } catch {
        toast.error('Could not confirm order. Please try again.');
      }
    };

    const handleReject = async () => {
      try {
        await rejectOrder({
          reference: order.reference,
          reason: rejectReason.trim() || undefined,
        }).unwrap();
        toast.success('Order rejected. The customer will be refunded for your items.');
        setShowRejectDialog(false);
        setRejectReason('');
      } catch {
        toast.error('Could not reject order. Please try again.');
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
          className='flex sm:flex w-full flex-col !overflow-hidden p-0 sm:max-w-[440px] !top-6 !bottom-6 !right-6 rounded-2xl custom-card-shadow bg-white dark:bg-card'
          style={{ height: 'calc(100vh - 3rem)', maxHeight: 'calc(100vh - 3rem)' }}
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
          <div className='flex-1 min-h-0 overflow-y-auto'>
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

              {/* ── Confirmation Status ── */}
              {vendorShipment && (
                <section className='space-y-3'>
                  <SectionTitle>Confirmation</SectionTitle>
                  <Card>
                    <DetailRow
                      label='Status'
                      value={
                        isRejected ? (
                          <span className='inline-flex items-center gap-1.5 text-sm font-medium text-[#D42620]'>
                            <XCircle className='size-3.5' />
                            Rejected
                          </span>
                        ) : isConfirmed ? (
                          <span className='inline-flex items-center gap-1.5 text-sm font-medium text-[#0F973D]'>
                            <CheckCircle className='size-3.5' />
                            Confirmed
                          </span>
                        ) : (
                          <span className='inline-flex items-center gap-1.5 text-sm font-medium text-[#DD900D]'>
                            <Clock className='size-3.5' />
                            Awaiting Confirmation
                          </span>
                        )
                      }
                    />
                    {isConfirmed && vendorShipment.confirmed_at && (
                      <DetailRow
                        label='Confirmed on'
                        value={formatDate(vendorShipment.confirmed_at)}
                      />
                    )}
                    {isConfirmed && vendorShipment.fulfillment_deadline && (
                      <DetailRow
                        label='Fulfill by'
                        value={
                          <span className={cn(
                            'text-sm font-medium',
                            new Date(vendorShipment.fulfillment_deadline) < new Date()
                              ? 'text-[#D42620]'
                              : 'text-[#333333] dark:text-white'
                          )}>
                            {formatDate(vendorShipment.fulfillment_deadline)}
                          </span>
                        }
                      />
                    )}
                    {isRejected && vendorShipment.rejected_at && (
                      <DetailRow
                        label='Rejected on'
                        value={formatDate(vendorShipment.rejected_at)}
                      />
                    )}
                    {isRejected && vendorShipment.rejection_reason && (
                      <DetailRow
                        label='Reason'
                        value={
                          <span className='text-sm text-grey3 dark:text-gray-400 italic'>
                            {vendorShipment.rejection_reason}
                          </span>
                        }
                        isLast
                      />
                    )}
                    {vendorShipment.late_penalty_applied && (
                      <div className='px-5 py-3 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800/50'>
                        <div className='flex items-start gap-2'>
                          <ShieldAlert className='size-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5' />
                          <p className='text-xs text-red-700 dark:text-red-300'>
                            Late penalty applied: {formatNaira(vendorShipment.late_penalty_amount ?? 0)} ({vendorShipment.late_penalty_days ?? 0} day{(vendorShipment.late_penalty_days ?? 0) !== 1 ? 's' : ''} late)
                          </p>
                        </div>
                      </div>
                    )}
                  </Card>
                </section>
              )}

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

              {/* ── Fabric Transfer (Outgoing — You are the fabric vendor) ── */}
              {outgoingFabricTransfers.length > 0 && (
                <section className='space-y-3'>
                  <SectionTitle>📦 Fabric Transfer</SectionTitle>
                  {outgoingFabricTransfers.map((transfer) => {
                    const destName = extractBizName(transfer.destination_business);
                    const fabricName = extractFabricName(transfer.fabric_product);
                    const sBadge = shipmentStatusBadge(transfer.status);
                    return (
                      <Card key={transfer._id}>
                        <DetailRow
                          label='Ship to'
                          value={
                            <span className='text-sm font-medium'>
                              {destName} <span className='text-xs text-muted-foreground'>(Tailor)</span>
                            </span>
                          }
                        />
                        <DetailRow
                          label='Item'
                          value={`${transfer.fabric_yards ?? '—'} yards of ${fabricName}`}
                        />
                        {transfer.courier_name && (
                          <DetailRow label='Courier' value={transfer.courier_name} />
                        )}
                        <DetailRow
                          label='Fee'
                          value={
                            <span>
                              {formatNaira(transfer.shipping_fee)}{' '}
                              <span className='text-xs text-muted-foreground'>(paid by customer)</span>
                            </span>
                          }
                        />
                        <DetailRow
                          label='Status'
                          value={
                            <span
                              className={cn(
                                'inline-flex h-[26px] items-center justify-center whitespace-nowrap rounded-lg px-3 text-xs font-medium',
                                sBadge.className
                              )}
                            >
                              {sBadge.label}
                            </span>
                          }
                          isLast
                        />
                      </Card>
                    );
                  })}
                </section>
              )}

              {/* ── Incoming Fabric (You are the tailor/receiver) ── */}
              {incomingFabricTransfers.length > 0 && (
                <section className='space-y-3'>
                  <SectionTitle>
                    {pendingIncomingFabric.length > 0 ? '🧵 Incoming Fabric' : '🧵 Fabric Received ✓'}
                  </SectionTitle>
                  {incomingFabricTransfers.map((transfer) => {
                    const sourceName = extractBizName(transfer.business);
                    const fabricName = extractFabricName(transfer.fabric_product);
                    const isDelivered = transfer.status === 'delivered';
                    const sBadge = shipmentStatusBadge(transfer.status);
                    return (
                      <Card key={transfer._id}>
                        <DetailRow label='From' value={sourceName} />
                        <DetailRow
                          label='Item'
                          value={`${transfer.fabric_yards ?? '—'} yards of ${fabricName}`}
                        />
                        <DetailRow
                          label='Status'
                          value={
                            <span
                              className={cn(
                                'inline-flex h-[26px] items-center justify-center whitespace-nowrap rounded-lg px-3 text-xs font-medium',
                                sBadge.className
                              )}
                            >
                              {sBadge.label}
                            </span>
                          }
                          isLast={isDelivered}
                        />
                        {!isDelivered && (
                          <div className='px-5 py-3 bg-amber-50 dark:bg-amber-900/20 border-t border-amber-200 dark:border-amber-800/50'>
                            <div className='flex items-start gap-2'>
                              <AlertTriangle className='size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5' />
                              <p className='text-xs text-amber-700 dark:text-amber-300'>
                                You cannot fulfill this order until the fabric arrives and is marked as delivered.
                              </p>
                            </div>
                          </div>
                        )}
                        {isDelivered && (
                          <div className='px-5 py-3 bg-emerald-50 dark:bg-emerald-900/20 border-t border-emerald-200 dark:border-emerald-800/50'>
                            <p className='text-xs text-emerald-700 dark:text-emerald-300'>
                              ✓ Fabric received — you can now start working on this order!
                            </p>
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </section>
              )}

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

          {/* Reject Confirmation Dialog */}
          {showRejectDialog && (
            <div className='absolute inset-0 z-50 flex items-center justify-center bg-black/40 rounded-2xl'>
              <div className='mx-6 w-full max-w-sm rounded-2xl bg-white dark:bg-card p-6 space-y-4 shadow-xl'>
                <div className='flex items-start gap-3'>
                  <div className='flex size-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 shrink-0'>
                    <XCircle className='size-5 text-red-600 dark:text-red-400' />
                  </div>
                  <div>
                    <h4 className='text-sm font-semibold text-[#0C0C0D] dark:text-white'>
                      Reject this order?
                    </h4>
                    <p className='mt-1 text-xs text-grey3 dark:text-gray-400 leading-relaxed'>
                      The customer will be refunded for your items and shipping.
                      This action cannot be undone.
                    </p>
                  </div>
                </div>
                <textarea
                  placeholder='Reason (optional)'
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={2}
                  className='w-full rounded-lg border border-[#DDE2E5] dark:border-border bg-transparent px-3 py-2 text-sm text-[#333333] dark:text-white placeholder:text-grey3 focus:outline-none focus:ring-2 focus:ring-red-500/30 resize-none'
                />
                <div className='flex gap-3'>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => {
                      setShowRejectDialog(false);
                      setRejectReason('');
                    }}
                    className='flex-1 h-10 text-sm'
                  >
                    Cancel
                  </Button>
                  <Button
                    type='button'
                    onClick={handleReject}
                    disabled={isRejecting}
                    className='flex-1 h-10 text-sm bg-red-600 hover:bg-red-700 text-white'
                  >
                    {isRejecting ? 'Rejecting...' : 'Reject Order'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className='shrink-0 border-t border-border px-6 py-4'>
            <div className='flex items-center gap-3'>
              {/* Confirm / Reject — shown when order needs confirmation */}
              {needsConfirmation && (
                <>
                  <Button
                    type='button'
                    onClick={handleConfirm}
                    disabled={isConfirming}
                    className='flex-1 h-11 gap-2 text-sm bg-[#0F973D] hover:bg-[#0D8534] text-white'
                  >
                    <CheckCircle className='size-4' />
                    {isConfirming ? 'Confirming...' : 'Confirm Order'}
                  </Button>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => setShowRejectDialog(true)}
                    disabled={isRejecting}
                    className='flex-1 h-11 gap-2 text-sm border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20'
                  >
                    <XCircle className='size-4' />
                    Reject
                  </Button>
                </>
              )}
              {/* Fulfill — shown after confirmation */}
              {canFulfill && (
                <Button
                  type='button'
                  onClick={handleFulfill}
                  disabled={isFulfilling}
                  className='flex-1 h-11 gap-2 text-sm'
                >
                  <Truck className='size-4' />
                  {isFulfilling
                    ? 'Creating label...'
                    : outgoingFabricTransfers.length > 0
                      ? 'Fulfill & Ship to Tailor'
                      : 'Fulfill Order'}
                </Button>
              )}
              {pendingIncomingFabric.length > 0 && canFulfillBase && (
                <Button
                  type='button'
                  disabled
                  variant='outline'
                  className='flex-1 h-11 gap-2 text-sm opacity-60'
                >
                  <AlertTriangle className='size-4 text-amber-500' />
                  Waiting for fabric from {extractBizName(pendingIncomingFabric[0].business)}
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
              {/* Rejected badge — no actions available */}
              {isRejected && (
                <div className='flex-1 flex items-center justify-center h-11 gap-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800'>
                  <XCircle className='size-4' />
                  Order Rejected
                </div>
              )}
              {/* Print invoice fallback */}
              {!needsConfirmation && !canFulfill && !hasLabel && !isRejected && (
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
                variant={needsConfirmation || canFulfill || hasLabel ? 'outline' : 'default'}
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
